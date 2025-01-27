<script lang="ts">
    import { onMount } from "svelte";
    import VirtualList from "../assets/VirtualList.svelte";
    import extractPKZ, { type FileData, type PartialFile } from "../_lib/files/PKZ/extract";
    import extract_partial from "../_lib/files/PKZ/extract_partial";
    import PlatinumFileReader from "../_lib/files/PlatinumFileReader";
    import { IconExclamationCircle, IconFile, IconSearch, IconX } from "@tabler/icons-svelte";
    import Loading from "../assets/Loading.svelte";
    import { questsCache, textCache } from "../store";
    import { lookup } from "../_lib/lookupTable";

    export let onClick: (quest: {name: string, arrayBuffer: ArrayBuffer}) => void;

    let fileData: FileData|null = null;
    let query = "";

    async function fetchQuests() {
        if (!$questsCache) {
            let response = await fetch('./quest.pkz');
            if (!response.ok) throw new Error('Network response was not ok.');
            let reader = new PlatinumFileReader(await response.arrayBuffer());
            fileData = await extractPKZ(reader);
            $questsCache = fileData;
        } else {
            fileData = $questsCache;
        }
    }

    async function fetchText() {
        if (!$textCache) {
            let response = await fetch('./TalkSubtitleMessage_USen.json');
            if (!response.ok) throw new Error('Network response was not ok.');
            let json = await response.json();
            // convert objects to maps
            for (let [key, value] of Object.entries(json)) {
                json[key] = new Map(Object.entries(value as {[key: string]: string[]}));
            }
            $textCache = {strings: json};
            
            /*
            // Legacy load directly from PTD - very slow!
            let response = await fetch('./TalkSubtitleMessage_USen.bin');
            if (!response.ok) throw new Error('Network response was not ok.');
            let reader = new PlatinumFileReader(await response.arrayBuffer());
            $textCache = await extractPTD(reader);
            */
        }
    }

    function readableBytes(bytes: number) {
        if (bytes == 0) {
            return "0 B"
        }
        var i = Math.floor(Math.log(bytes) / Math.log(1024)),
        sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
    }

    async function openAll() {
        if (fileData == null) return;
        for (let file of fileData.files) {
            await clickFile(file);
        }
    }


    onMount(() => {
        fetchQuests();
        fetchText();
    })

    async function clickFile(partialFile: PartialFile) {
        if (fileData == null) return;
        let result = await extract_partial(partialFile, fileData);
        onClick({name: result.name, arrayBuffer: result.data});
    }

    let scrollElem: HTMLDivElement;

    $: list = !query.length ?
        fileData?.files : 
        fileData?.files.filter(f => f.name.toLowerCase().includes(query.toLowerCase()) || lookup(f.name).toLowerCase().includes(query.toLowerCase()));

    // @ts-ignore
    $: if (scrollElem && list) document.querySelector("svelte-virtual-list-viewport").scrollTop = 0;
</script>

{#if fileData}
    <div class="searchBar">
        <IconSearch />
        <input bind:value={query} type="text" placeholder={`Search ${fileData.files.length} quests...`} />
        {#if query.length}
            <button class="transparentBtn" style="padding: 5px; color: white" on:click={() => query = ""}>
                <IconX />
            </button>
        {/if}
    </div>
    <VirtualList bind:this={scrollElem} items={list} height={"300px"} let:item>
        <button class="transparentBtn" on:click={clickFile.bind(null, item)} style="width: 400px">
            <IconFile />
            <div class="text">
                {#if !lookup(item.name.slice(0, -4)).startsWith("quest")}
                    <span>{lookup(item.name.slice(0, -4))}</span>
                {:else}
                    <div style="background-color: red">UNKNOWN</div>
                {/if}
                <span class="id">QUEST {item.name.slice(5, 9)} - {readableBytes(item.size)}</span>
            </div>
        </button>
    </VirtualList>
    <button class="transparentBtn" style="color: var(--danger)" on:click={openAll}>
        <IconExclamationCircle />
        Open all (may take a while)
    </button>
{:else}
    <div class="loading">
        <Loading style="margin-bottom: 275px" />
    </div>
{/if}

<style>
    .searchBar {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;
        background-color: #444;
        padding: 10px;
        border-radius: 5px;
        width: 400px;
    }
    .searchBar input {
        width: 100%;
        background-color: transparent;
        border: none;
        height: 100%;
        outline: none;
        font-size: 16px;
    }
    .text {
        display: flex;
        flex-direction: column;
        align-items: left;
        width: 100%;
        text-align: left;
    }
    .text .id {
        font-weight: bold;
        color: #888;
        text-transform: uppercase;
        font-family: monospace;
    }
</style>