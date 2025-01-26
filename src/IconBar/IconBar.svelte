<script lang="ts">
    import { IconPlus, IconCheck, IconPackages, IconLetterCase } from '@tabler/icons-svelte';
    import { session, sessions, textCache } from '../store';
    import Loading from '../assets/Loading.svelte';
    import Icon from './Icon.svelte';

    import repackPTD from "../_lib/files/PTD/repack";
    import extractPKZ from "../_lib/files/PKZ/extract";
    import extractPartialPKZ from "../_lib/files/PKZ/extract_partial";
    import repackPKZ from "../_lib/files/PKZ/repack";
    import PlatinumFileReader from "../_lib/files/PlatinumFileReader";
    import { zipSync } from "fflate";

    let packaging: null|string[] = null;
    let logElem: HTMLDivElement;
    async function exportAllSessionsAsMod() {
        const start = performance.now();
        packaging = ["<b>[!] Exporting all sessions as a mod...</b>"];
        await new Promise(r => setTimeout(r, 0));

        const files: {[key: string]: any} = {};
    
        for (let i = 0; i < $sessions.length; i++) {
            packaging = [...packaging, `[+] Exporting quest <b>q${$sessions[i].id.toUpperCase()}</b>...`]
            await new Promise(r => setTimeout(r, 0));
            const file = await $sessions[i].repack();
            if (file) {
                files[`romfs/quest/quest${$sessions[i].id}.dat`] = new Uint8Array(file);
            }
        }
        const finishedSessions = performance.now();
        packaging = [...packaging, `[!] Finished exporting all sessions in ${Math.round(finishedSessions - start)}ms`];

        // package text
        if ($textCache) {
            packaging = [...packaging, "[!] Repacking text file with modifications..."];
            await new Promise(r => setTimeout(r, 0));
            const repacked = await repackPTD($textCache);
            packaging = [...packaging, "[!] Making PKZ..."];
            await new Promise(r => setTimeout(r, 0));

            let response = await fetch('./Text.pkz');
            if (!response.ok) {
                packaging = [...packaging, '<span style="color: var(--danger)">[-] ERROR: Network response was not ok. Stopping...</span>'];
                return;
            }
            let reader = new PlatinumFileReader(await response.arrayBuffer());
            const pkz = await extractPKZ(reader);
            const pkzFiles = await Promise.all(pkz.files.map(f => extractPartialPKZ(f, pkz)));

            let fileToReplace = pkzFiles.find(f => f.name == "TalkSubtitleMessage_USen.bin");
            if (fileToReplace) {
                fileToReplace.data = repacked;
            } else {
                packaging = [...packaging, '<span style="color: var(--danger)">[-] ERROR: Couldn\'t find TalkSubtitleMessage_USen.bin in Text.pkz! This error shouldn\'t occur...</span>'];
                console.error("Couldn't find TalkSubtitleMessage_USen.bin in Text.pkz!");
            }

            files["romfs/Text/Text.pkz"] = new Uint8Array(await repackPKZ(pkzFiles, "ZStandard"));

            const finishedRepackingText = performance.now();
            packaging = [...packaging, `[!] Finished repacking text in ${Math.round(finishedRepackingText - finishedSessions)}ms`];
        }

        packaging = [...packaging, "[!] Zipping..."];
        await new Promise(r => setTimeout(r, 0));

        const zipped = zipSync(files);

        let blob = new Blob([zipped], { type: "application/octet-stream" });
        let url = URL.createObjectURL(blob);
        let a = document.createElement("a");
        a.href = url;
        a.download = `mod-complete.zip`;
        a.click();
        URL.revokeObjectURL(url);

        const finishedZipping = performance.now();
        packaging = [...packaging, `[!] Mod packaging complete! :D It took ${Math.round(finishedZipping - start)}ms.`, 'Dismissing in 10 seconds...'];
        await new Promise(r => setTimeout(r, 10000));
        packaging = null;
    }

    $: {
        if (packaging !== null && logElem) {
            logElem.scrollTop = logElem.scrollHeight;
        }
    }
</script>

<div class="iconBar">
    {#each $sessions as ses, i}
        <Icon ses={ses} />
    {/each}
    <button
        class="session"
        class:active={$session == null}
        on:click={() => $session = null}
    >
        <IconPlus />
    </button>
    <div style="flex-grow: 1" />
    <footer>
        <hr />
        <button
            class="session"
            title="Manage in-game text"
            style="margin-bottom: 5px"
            class:active={$session === "text"}
            on:click={() => $session = "text"}
        >
            <IconLetterCase />
        </button>
        <button
            class="session"
            title="Export all sessions as mod"
            class:active={packaging !== null}
            on:click={exportAllSessionsAsMod}
        >
            {#if packaging !== null && packaging[packaging.length - 1].startsWith("Dismissing in")}
                <IconCheck />
            {:else if packaging !== null}
                <Loading text="" />
            {:else}
                <IconPackages />
            {/if}
        </button>
    </footer>
</div>

{#if packaging !== null}
    <div class="iconTooltip" style="bottom: -5px">
        <div class="log" bind:this={logElem}>
            {#each packaging as logItem}
                <p>{@html logItem}</p>
            {/each}
        </div>
    </div>
{/if}

<style>
    .iconBar {
        padding: 0 10px;
        padding-top: 10px;
        height: calc(100% - 10px);
        border-right: 1px solid #444;
        background-color: #111;
        z-index: 12;

        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        overflow-y: auto;
    }

    .iconBar::-webkit-scrollbar {
        width: 0px;
    }

    footer {
        position: sticky;
        bottom: 0;
        background-color: #111;
    }

    .session {
        width: 45px;
        height: 34px;
        font-weight: bold;
        flex-shrink: 0;
        line-height: 0;
        padding: 5px;
        border-radius: 5px;
        background-color: transparent;
        transition: background-color 0.1s ease-in-out;
    }

    .session:hover {
        background-color: #444;
    }

    .session.active {
        background-color: #666;
        cursor: default;
    }
    .iconTooltip {
        position: fixed;
        left: 70px;
        transform: translateY(-20px);
        z-index: 15;
        background-color: #111;
        padding: 5px;
        border-radius: 5px;
        font-weight: bold;
    }
    .iconTooltip:before {
        content: "";
        position: absolute;
        bottom: 12px;
        left: -10px;
        transform: rotate(90deg);
        border: 5px solid transparent;
        border-top-color: #111;
    }
    .log {
        width: 500px;
        max-height: 500px;
        overflow-y: auto;
    }
    .log p {
        margin: 0;
        font-weight: normal;
        font-family: monospace;
        font-size: 18px;
    }
</style>