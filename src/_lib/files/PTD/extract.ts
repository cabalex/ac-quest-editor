import type PlatinumFileReader from "../PlatinumFileReader";
import { b_crc32 } from "../DAT/lib/generateDATHash";

// Thanks to all the people who have decoded this format over the years:
// NWplayer123 & Xzonn: https://gist.github.com/Xzonn/0b9061e216da155c653eb6e45d9858bc
// Kerilk: https://github.com/Kerilk/bayonetta_tools/blob/master/binary_templates/Astral%20Chain%20ptd.bt
// Me: https://github.com/cabalex/astral-extractor/blob/main/scripts/filetypes/ptd.js

export interface FileData {
    strings: {[key: string]: Map<string, string[]>}
}


async function extract(file: PlatinumFileReader): Promise<FileData> {
    const decoder = new TextDecoder("utf-16le");
    async function toString(start: number, end: number) {
        // strings have a 0x26 offset?
        const buffer = new Uint8Array(await file.read(start, end)).map(v => v - 0x26);
        return decoder.decode(buffer).slice(0, -1);
    }

    const headerArrayBuffer = await file.read(0, 28);
    const headerDataView = new DataView(headerArrayBuffer);

    const header = {
        // magic: headerDataView.getUint32(0, true), // PTD\x00
        // version: headerDataView.getUint32(4, true), // always 2?
        // unknown: headerDataView.getUint32(8, true), // always 38?
        keyCount: headerDataView.getUint32(12, true),
        keyTableOffset: headerDataView.getUint32(16, true),
        sectionCount: headerDataView.getUint32(20, true),
        sectionTableOffset: headerDataView.getUint32(24, true),
    }

    // key headers
    const keyHeaders = [];
    for (let i = 0; i < header.keyCount; i++) {
        const keyHeaderArrayBuffer = await file.read(header.keyTableOffset + i * 16, header.keyTableOffset + (i + 1) * 16);
        const keyHeaderDataView = new DataView(keyHeaderArrayBuffer);

        keyHeaders.push({
            hash: keyHeaderDataView.getUint32(0, true),
            offset: header.keyTableOffset + i * 16 + keyHeaderDataView.getUint32(4, true), // relative offset (changed to global) from current position
            length: keyHeaderDataView.getUint32(8, true), // # of 2-byte utf16 characters
            byteLength: keyHeaderDataView.getUint32(12, true), // length of string
        });
    }

    // key values
    const keys = new Map<number, string>();
    for (let i = 0; i < header.keyCount; i++) {
        keys.set(keyHeaders[i].hash, await toString(keyHeaders[i].offset, keyHeaders[i].offset + keyHeaders[i].byteLength))
    }

    const strings: {[key: string]: Map<string, string[]>} = {};

    // temp, try to remove later
    const usedKeys: string[] = [];

    // sections
    for (let j = 0; j < header.sectionCount; j++) {
        const sectionStrings = new Map<string, string[]>();
        const sectionHeaderArrayBuffer = await file.read(header.sectionTableOffset + j * 20, header.sectionTableOffset + (j + 1) * 20);
        const sectionHeaderDataView = new DataView(sectionHeaderArrayBuffer);

        const sectionHeader = {
            hash: sectionHeaderDataView.getUint32(0, true),
            name: keys.get(sectionHeaderDataView.getUint32(0, true)) || "unknown",
            valueHeaderCount: sectionHeaderDataView.getUint32(4, true),
            valueOffset: header.sectionTableOffset + j * 20 + sectionHeaderDataView.getUint32(8, true),
            stringHeaderCount: sectionHeaderDataView.getUint32(12, true),
            stringOffset: header.sectionTableOffset + j * 20 + sectionHeaderDataView.getUint32(16, true),
        }

        const dataHeaders = [];
        for (let i = 0; i < sectionHeader.valueHeaderCount; i++) {
            const dataHeaderArrayBuffer = await file.read(sectionHeader.valueOffset + i * 12, sectionHeader.valueOffset + (i + 1) * 12);
            const dataHeaderDataView = new DataView(dataHeaderArrayBuffer);

            dataHeaders.push({
                hash: dataHeaderDataView.getUint32(0, true),
                count: dataHeaderDataView.getUint32(4, true),
                offset: sectionHeader.valueOffset + i * 12 + dataHeaderDataView.getUint32(8, true),
            });
        }


        const stringHeaders = [];
        for (let i = 0; i < sectionHeader.stringHeaderCount; i++) {
            const stringHeaderArrayBuffer = await file.read(sectionHeader.stringOffset + i * 12, sectionHeader.stringOffset + (i + 1) * 12);
            const stringHeaderDataView = new DataView(stringHeaderArrayBuffer);

            stringHeaders.push({
                hash: stringHeaderDataView.getUint32(0, true),
                count: stringHeaderDataView.getUint32(4, true),
                offset: sectionHeader.stringOffset + i * 12 + stringHeaderDataView.getUint32(8, true),
            });
        }

        const hashOffset = sectionHeader.valueOffset + sectionHeader.valueHeaderCount * 12;
        const hashes = new Uint32Array(
            await file.read(hashOffset, hashOffset + stringHeaders[0].count * 4)
        );

        for (let i = 0; i < stringHeaders.length; i++) {
            for (let x = 0; x < stringHeaders[i].count; x++) {
                const localValueHeaderArrayBuffer = await file.read(stringHeaders[i].offset + x * 16, stringHeaders[i].offset + (x + 1) * 16);
                const localValueHeaderDataView = new DataView(localValueHeaderArrayBuffer);
                
                const localHeader = {
                    hash: localValueHeaderDataView.getUint32(0, true),
                    offset: stringHeaders[i].offset + x * 16 + localValueHeaderDataView.getUint32(4, true),
                    count: localValueHeaderDataView.getUint32(8, true),
                    size: localValueHeaderDataView.getUint32(12, true),
                }

                const string = await toString(localHeader.offset, localHeader.offset + localHeader.size);
                
                let key = keys.get(localHeader.hash);
                if (key) {
                    let array = [...(sectionStrings.get(key) || []), string];
                    sectionStrings.set(key, array);
                    usedKeys.push(key);
                } else {
                    console.warn('[PTD] No key found for hash ', localHeader.hash.toString(16));
                }
            }
        }

        strings[sectionHeader.name] = sectionStrings;
    }

    return { strings }
}

export default extract;