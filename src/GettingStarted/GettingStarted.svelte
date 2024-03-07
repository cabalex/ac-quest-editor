<script lang="ts">
    import { unzipSync } from "fflate";
    import { IconFileImport, IconFilePlus } from "@tabler/icons-svelte";
    import PlatinumFileReader from "../_lib/files/PlatinumFileReader";
    import extract from "../_lib/files/DAT/extract";
    import extractPKZ from "../_lib/files/PKZ/extract";
    import extract_partial from "../_lib/files/PKZ/extract_partial";
    import extractPTD from "../_lib/files/PTD/extract";
    import Quest from "../_lib/Quest";
    import { session, sessions, textCache } from "../store";
    import QuestList from "./QuestList.svelte";
    import QuestData from "../_lib/types/QuestData";
    import EnemySet from "../_lib/types/EnemySet";
    import BezierData from "../_lib/types/BezierData";

    let inputElem: HTMLInputElement;
    export let hidden: boolean = false;

    async function uploadFile(e: any) {
        if (e.target.files[0].name.endsWith(".dat")) {
            loadQuest({name: e.target.files[0].name, arrayBuffer: e.target.files[0]});
        } else {
            // zip file with Text in it
            const unzipped = unzipSync(new Uint8Array(await new PlatinumFileReader(e.target.files[0]).read()));

            console.log(unzipped);

            const textPKZ = Object.keys(unzipped).find(f => f.endsWith("Text/Text.pkz"));
            if (textPKZ) {
                const extracted = await extractPKZ(new PlatinumFileReader(unzipped[textPKZ].buffer));
                const text = extracted.files.find(f => f.name === "TalkSubtitleMessage_USen.bin");

                if (text) {
                    const textArrayBuffer = (await extract_partial(text, extracted)).data;
                    $textCache = await extractPTD(new PlatinumFileReader(textArrayBuffer));
                    console.log("Extracted text file from ZIP", $textCache);
                }
            }
            
            for (let [name, value] of Object.entries(unzipped)) {
                if (name.endsWith(".dat")) {
                    loadQuest({name: name.split("/").pop(), arrayBuffer: value.buffer});
                }
            }
        }
    }

    async function loadQuest(file: any) {
        let reader = new PlatinumFileReader(file.arrayBuffer);
        let result = await extract(reader);
        try {
            $sessions = [...$sessions, Quest.fromDAT(file.name, result, $textCache || undefined)]
            $session = $sessions[$sessions.length - 1];
        } catch (e: any) {
            alert(`FAILED loading ${file.name}:\n${e.message}\n\nCheck console for more details.`);
            throw e;
        }
    }

    function newQuest() {
        $sessions = [...$sessions, new Quest("0000", new QuestData(), new EnemySet([], []), new BezierData({
            name: "BEZIER",
            attributes: {},
            value: "",
            children: []
        }))];
        $session = $sessions[$sessions.length - 1];
        console.log($session);
    }

    // For some reason, the map can be laggy to remove itself.
    // This hack deletes the DOM element early.
    $: if (!hidden && document.getElementsByClassName('mapContainer').length) {
        document.getElementsByClassName('mapContainer')[0].remove();
    }
</script>
<input
    bind:this={inputElem}
    on:change={uploadFile}
    accept=".dat,.zip"
    type="file"
    style="display: none"
/>
<div class="gettingStartedOuter" style={hidden ? "display: none" : ""}>
    <div class="gettingStarted">
        <h1>Astral Chain Quest Editor <span>v2.0-pre</span></h1>
        <p>created by <a href="https://cabalex.github.io" target="_blank" rel="noopener noreferrer">cabalex</a>.</p>
        <div class="row">
            <section>
                <h2>Get started</h2>
                <button class="transparentBtn" on:click={newQuest}>
                    <IconFilePlus />
                    New file...
                </button>
                <button class="transparentBtn" on:click={() => inputElem.click()}>
                    <IconFileImport />
                    Import...
                </button>
            </section>
            <section>
                <h2>Explore the game</h2>
                <QuestList onClick={loadQuest} />
            </section>
        </div>
    </div>
</div>

<style>
    .gettingStartedOuter {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .gettingStarted {
        display: flex;
        flex-direction: column;
        justify-content: center;
        height: 100%;
        width: min(700px, calc(100vw - 300px));
    }
    h1 span {
        margin: 0;
        color: #ccc;
        font-size: 0.75em;
        font-weight: normal;
    }
    h1, p {
        margin: 0;
        text-align: center;
    }
    h1 {
        font-size: 2em;
    }
    .row {
        display: grid;
        grid-template-columns: 1fr 1fr;
    }
    .row section {
        width: 100%;
    }
</style>