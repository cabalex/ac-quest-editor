import { get, type Writable } from "svelte/store";
import { questsCache } from "../store";
import PlatinumFileReader from "../_lib/files/PlatinumFileReader";
import extractPKZ from "../_lib/files/PKZ/extract";
import extract_partial from "../_lib/files/PKZ/extract_partial";
import extractDAT from "../_lib/files/DAT/extract";
import Quest from "../_lib/Quest";
import { zipSync } from "fflate";
import { questType } from "../_lib/lookupTable";

// https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
function cyrb128(str: string): [number, number, number, number] {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    h1 ^= (h2 ^ h3 ^ h4), h2 ^= h1, h3 ^= h1, h4 ^= h1;
    return [h1>>>0, h2>>>0, h3>>>0, h4>>>0];
}

function sfc32(a: number, b: number, c: number, d: number) {
    return function() {
      a |= 0; b |= 0; c |= 0; d |= 0;
      let t = (a + b | 0) + d | 0;
      d = d + 1 | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = (c << 21 | c >>> 11);
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    }
  }
  


class RandomWithSeed {
    constructor(seed: string) {
        this.seed = seed;
        this.rand = sfc32(...cyrb128(seed));
    }
    seed: string
    rand: () => number;
    next() {
        return this.rand()
    }
}

async function extractQuests() {
    let fileData = get(questsCache);
    if (fileData === null) {
        let response = await fetch('./quest.pkz');
        if (!response.ok) throw new Error('Network response was not ok.');
        let reader = new PlatinumFileReader(await response.arrayBuffer());
        fileData = await extractPKZ(reader);
        questsCache.set(fileData);
    }

    let quests = [];
    for (let file of fileData.files) {
        let datFile = await extract_partial(file, fileData);
        let reader = new PlatinumFileReader(datFile.data);
        quests.push(Quest.fromDAT(file.name, await extractDAT(reader)));
    }
    return quests;
}

export default async function randomize(
    em: boolean,
    pl: boolean,
    bg: boolean,
    ba: boolean,
    mode: 'fixed-pool'|'true-random',
    noTypeChecks: boolean,
    lappyMode: boolean,
    progressWritable: Writable<string>,
    seed: string = ''
) {
    const seedRandomizer = new RandomWithSeed(seed === '' ? Math.random().toString().replace(".", "") : seed);

    progressWritable.set('Extracting quest data...');
    const quests = await extractQuests();

    console.log(quests)
    let rawPool = generatePool(quests);

    if (mode === 'true-random') {
        // In true random mode, the pool is used to find what entity types are allowed
        rawPool = Array.from(new Set(rawPool));
    }

    const emPool = rawPool.filter(x => x >> 16 === 0x2);
    const plPool = rawPool.filter(x => x >> 16 === 0x1);
    const bgPool = rawPool.filter(x => x >> 16 === 0xC);
    const baPool = rawPool.filter(x => x >> 16 === 0xF);

    for (let quest of quests) {
        for (let set of quest.enemySet.sets) {
            for (let enemy of set.ems) {
                let sameIds = enemy.Id === enemy.IdL;
                let type = questType(enemy.Id);
                
                // Make Lappy if a pl!
                if (type === 'pl' && lappyMode) {
                    enemy.Id = 0x12100;
                    if (sameIds) enemy.IdL = 0x12100;
                    continue;
                }
                
                if (noTypeChecks) {
                    if (rawPool.length === 0) continue;
                    
                    // just take from the raw pool
                    let randomIndex = Math.floor(seedRandomizer.next() * rawPool.length);
                    enemy.Id = rawPool[randomIndex];
                    if (sameIds) enemy.IdL = rawPool[randomIndex];

                    if (mode === 'fixed-pool') {
                        // remove from pool
                        rawPool.splice(randomIndex, 1);
                    }
                } else {
                    let selectedPool: number[] = [];
                    if (type === 'em') {
                        if (!em) continue;
                        selectedPool = emPool;
                    } else if (type === 'pl') {
                        if (!pl) continue;
                        selectedPool = plPool;
                    } else if (type === 'bg') {
                        if (!bg) continue;
                        selectedPool = bgPool;
                    } else if (type === 'ba') {
                        if (!ba) continue;
                        selectedPool = baPool;
                    }
                    if (selectedPool.length === 0) continue;

                    let randomIndex = Math.floor(seedRandomizer.next() * selectedPool.length);
                    enemy.Id = selectedPool[randomIndex];
                    if (sameIds) enemy.IdL = selectedPool[randomIndex];

                    if (mode === 'fixed-pool') {
                        // remove from pool
                        selectedPool.splice(randomIndex, 1);
                    }
                }
            }
        }
    }

    // repack
    progressWritable.set('Repacking quests...');
    await new Promise(resolve => setTimeout(resolve, 300));
    await repackMod(quests, seedRandomizer.seed, progressWritable);

    return seedRandomizer.seed;
}

function generatePool(quests: Quest[]) {
    let pool = [];
    for (let quest of quests) {
        for (let set of quest.enemySet.sets) {
            for (let enemy of set.ems) pool.push(enemy.Id);
        }
    }
    return pool;

}

async function repackMod(quests: Quest[], seed: string, progressWritable: Writable<string>) {
    const files: {[key: string]: any} = {};

    for (let i = 0; i < quests.length; i++) {
        let quest = quests[i];
        progressWritable.set(`Repacking q${quest.id}... [${i + 1}/${quests.length}]`);
        await new Promise(resolve => setTimeout(resolve, 0));
        let file = await quest.repack();
        if (file) {
            files[`romfs/quest/quest${quest.id}.dat`] = new Uint8Array(file);
        }
    }

    const zipped = zipSync(files);

    let blob = new Blob([zipped], { type: "application/octet-stream" });
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.href = url;
    a.download = `randomizer-${seed}.zip`;
    a.click();
    URL.revokeObjectURL(url);
}