<script lang="ts">
    import { onMount } from "svelte";
    import VirtualList from "@sveltejs/svelte-virtual-list";
    import extract, { type FileData, type PartialFile } from "../_lib/files/PKZ/extract";
    import extract_partial from "../_lib/files/PKZ/extract_partial";
    import PlatinumFileReader from "../_lib/files/PlatinumFileReader";
    import { IconFile, IconSearch } from "@tabler/icons-svelte";
    import Loading from "../assets/Loading.svelte";
    import { questsCache } from "../store";
  import { lookup } from "../_lib/lookupTable";

    export let onClick: (quest: {name: string, arrayBuffer: ArrayBuffer}) => void;

    let fileData: FileData|null = null;
    let query = "";

    async function fetchQuests() {
        if (!$questsCache) {
            let response = await fetch('./quest.pkz');
            if (!response.ok) throw new Error('Network response was not ok.');
            let reader = new PlatinumFileReader(await response.arrayBuffer());
            fileData = await extract(reader);
            $questsCache = fileData;
        } else {
            fileData = $questsCache;
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


    onMount(() => {
        fetchQuests();
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

    $: if (scrollElem && list) document.querySelector("svelte-virtual-list-viewport").scrollTop = 0;
</script>

{#if fileData}
    <div class="searchBar">
        <IconSearch />
        <input bind:value={query} type="text" placeholder={`Search ${fileData.files.length} quests...`} />
    </div>
    <VirtualList bind:this={scrollElem} items={list} height={"300px"} let:item>
        <button class="transparentBtn" on:click={clickFile.bind(null, item)} style="width: 400px">
            <IconFile />
            <div class="text">
                <span>{lookup(item.name.slice(0, -4))}</span>
                <span class="id">QUEST {item.name.slice(5, 9)} - {readableBytes(item.size)}</span>
            </div>
        </button>
    </VirtualList>
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