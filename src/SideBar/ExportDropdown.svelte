<script lang="ts">
    import repackPKZ from "../_lib/files/PKZ/repack";
    import repackPTD from "../_lib/files/PTD/repack";
    import PlatinumFileReader from "../_lib/files/PlatinumFileReader";
    import extractPKZ from "../_lib/files/PKZ/extract";
    import extractPartialPKZ from "../_lib/files/PKZ/extract_partial";
    import { zipSync } from "fflate";
    import { IconCaretDownFilled, IconDownload, IconLoader2, IconPackageExport } from "@tabler/icons-svelte";
    import RepackModal from "./RepackModal.svelte";
    import { session, textCache } from "../store";

    let repackDropdownOpen = false;
    let repacking = false;
    let repackModalOpen = false;
    async function repackageMod() {
        repacking = true;
        repackDropdownOpen = false;
        
        // must wrap in setTimeout to ensure the DOM updates beforehand
        setTimeout(async () => {
            let arrayBuffer = await $session?.repack($textCache || undefined).catch(console.error);
            if (arrayBuffer) {
                const files = {
                    [`romfs/quest/quest${$session?.id}.dat`]: new Uint8Array(arrayBuffer),
                }

                if ($textCache && $session?.talkScript) {
                    console.log("Repacking text file with modifications...");
                    const repacked = await repackPTD($textCache);
                    console.log("Making PKZ...");

                    let response = await fetch('./Text.pkz');
                    if (!response.ok) throw new Error('Network response was not ok.');
                    let reader = new PlatinumFileReader(await response.arrayBuffer());
                    const pkz = await extractPKZ(reader);
                    const pkzFiles = await Promise.all(pkz.files.map(f => extractPartialPKZ(f, pkz)));

                    let fileToReplace = pkzFiles.find(f => f.name == "TalkSubtitleMessage_USen.bin");
                    if (fileToReplace) {
                        fileToReplace.data = new Uint8Array(repacked);
                    } else {
                        console.error("Couldn't find TalkSubtitleMessage_USen.bin in Text.pkz!");
                    }

                    files["romfs/Text/Text.pkz"] = new Uint8Array(await repackPKZ(pkzFiles, "ZStandard"));
                }

                console.log("Zipping...");

                const zipped = zipSync(files);

                let blob = new Blob([zipped], { type: "application/octet-stream" });
                let url = URL.createObjectURL(blob);
                let a = document.createElement("a");
                a.href = url;
                a.download = `mod-${$session?.id}.zip`;
                a.click();
                URL.revokeObjectURL(url);

                if (!localStorage.getItem("acqe-hideRepackModal")) repackModalOpen = true;
            } else {
                alert("An error occurred during repack! Check the console for more details.");
            }

            repacking = false;
        }, 100);
    }

    async function repack() {
        repacking = true;
        repackDropdownOpen = false;
        
        // must wrap in setTimeout to ensure the DOM updates beforehand
        setTimeout(async () => {
            let arrayBuffer = await $session?.repack($textCache || undefined).catch(console.error);
            if (arrayBuffer) {
                let blob = new Blob([arrayBuffer], { type: "application/octet-stream" });
                let url = URL.createObjectURL(blob);
                let a = document.createElement("a");
                a.href = url;
                a.download = `quest${$session?.id}.dat`;
                a.click();
                URL.revokeObjectURL(url);

            } else {
                alert("An error occurred during repack! Check the console for more details.");
            }

            repacking = false;
        }, 0)
    }
</script>

{#if repacking}
    <button class:active={true}>
        <IconLoader2 class="loadingIcon" />
        Repacking...
    </button>
{:else}
    <div class="exportDropdown">
        <button on:click={repackageMod}>
            <IconPackageExport />
            Repackage
        </button>
        <button class="dropdownBtn" on:click={() => repackDropdownOpen = !repackDropdownOpen} class:open={repackDropdownOpen}>
            <span>
                <IconCaretDownFilled />
            </span>
        </button>
        {#if repackDropdownOpen}
            <button class="dropdownOption" on:click={repack}>
                <IconDownload />
                <div class="text">
                    <span>DAT only</span>
                    <span style="font-weight: normal; font-size: 14px">Does not repack Text data. Will not work if TalkScripts were modified.</span>
                </div>
            </button>
        {/if}
    </div>
{/if}

{#if repackModalOpen}
    <RepackModal on:close={() => repackModalOpen = false} />
{/if}

<style>
    .exportDropdown {
        width: 100%;
        display: flex;
        flex-direction: row;
        position: relative;
    }
    .exportDropdown > button:not(.dropdownBtn) {
        border-radius: 10px 0 0 10px;
    }
    button.dropdownBtn {
        width: 30px;
        padding: 0;
        justify-content: center;
        border-radius: 0 10px 10px 0;
    }
    .dropdownBtn span {
        line-height: 0;
        transition: transform 0.2s;
    }
    .dropdownBtn.open span {
        transform: rotate(180deg);
    }
    button {
        width: 100%;
        margin-bottom: 5px;
        justify-content: flex-start;
        background-color: transparent;
    }
    button:hover {
        background-color: #444;
    }
    button:active, .dropdownBtn.open {
        background-color: #666;
    }
    button.dropdownOption {
        position: absolute;
        bottom: 100%;
        width: 100%;
        margin-bottom: 5px;
        border-radius: 10px !important;
        background-color: #444 !important;
        border-radius: 5px;
        padding-right: 0;
        justify-content: flex-start;
        background-color: transparent;
    }
    .dropdownOption .text {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        text-align: left
    }
    .dropdownOption:hover {
        background-color: #666 !important;
    }
    .dropdownOption:active {
        background-color: #888 !important;
    }
    :global(.loadingIcon) {
        animation: spin 2s linear infinite;
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
</style>