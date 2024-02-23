<script lang="ts">
    import { fly } from "svelte/transition";
    import { currentTab, session, sessions } from "../store";
    import { cubicInOut } from "svelte/easing";
    import { IconCode, IconDownload, IconFlag, IconInfoCircle, IconLoader2, IconMap2, IconMessage, IconMessageX, IconTrash, IconUsersGroup } from "@tabler/icons-svelte";
    import { lookup } from "../_lib/lookupTable";
    import About from "./tabs/About.svelte";
    import EnemySets from "./tabs/EnemySets/EnemySets.svelte";
    import Areas from "./tabs/Areas/Areas.svelte";
    import Tasks from "./tabs/Tasks/Tasks.svelte";
    import TalkScripts from "./tabs/TalkScripts/TalkScripts.svelte";
    import RepackModal from "./RepackModal.svelte";
    import Flags from "./tabs/Flags.svelte";

    let repacking = false;
    let repackModalOpen = false;
    async function repack() {
        repacking = true;
        
        // must wrap in setTimeout to ensure the DOM updates beforehand
        setTimeout(async () => {
            let arrayBuffer = await $session?.repack().catch(console.error);
            if (arrayBuffer) {
                let blob = new Blob([arrayBuffer], { type: "application/octet-stream" });
                let url = URL.createObjectURL(blob);
                let a = document.createElement("a");
                a.href = url;
                a.download = `quest${$session?.id}.dat`;
                a.click();
                URL.revokeObjectURL(url);
                if (!localStorage.getItem("acqe-hideRepackModal")) repackModalOpen = true;
            } else {
                alert("An error occurred during repack! Check the console for more details.");
            }

            repacking = false;
        }, 0)
    }

    function deleteSession() {
        if (confirm("Are you sure you want to delete this session? It will be lost forever! (Repack if you want to come back to this later.)")) {
            let temp = $session;
            $session = null;
            setTimeout(() => $sessions = $sessions.filter(s => s !== temp), 200);
        }
    }

    function setTab(tab: string) {
        if ($currentTab == tab) {
            $currentTab = null;
            if ($session) $session.tab = null;
        } else {
            currentTab.set(tab);
            if ($session) $session.tab = tab;
        }
    }
</script>

<aside transition:fly={{x: -200, duration: 200, easing: cubicInOut}}>
    <header>
        <div class="text">
            <h1>
                Quest <b>{$session?.id}</b>
            </h1>
            <span>{lookup(`quest${$session?.id}`)}</span>
        </div>
    </header>
    <button class:active={$currentTab == "about"} on:click={() => setTab("about")}>
        <IconInfoCircle />
        About
    </button>
    <hr />
    <h2 class="sectionHeader">On the map</h2>
    <button class:active={$currentTab == "enemySets"} on:click={() => setTab("enemySets")}>
        <IconUsersGroup />
        Enemy Sets
    </button>
    <button class:active={$currentTab == "zones"} on:click={() => setTab("zones")}>
        <IconMap2 />
        Areas
    </button>
    <h2 class="sectionHeader">Quest logic</h2>
    <button class:active={$currentTab == "tasks"} on:click={() => setTab("tasks")}>
        <IconCode />
        Tasks
    </button>
    <button class:active={$currentTab == "flags"} on:click={() => setTab("flags")}>
        <IconFlag />
        Flags
    </button>
    <button class:active={$currentTab == "talkScripts"} on:click={() => setTab("talkScripts")}>
        {#if $session?.talkScript}
            <IconMessage />
        {:else}
            <IconMessageX />
        {/if}
        TalkScripts
    </button>
    <div style="flex-grow: 1; height: 100%" />
    <hr />
    {#if repacking}
        <button class:active={true}>
            <IconLoader2 class="loadingIcon" />
            Repacking...
        </button>
    {:else}
        <button on:click={repack}>
            <IconDownload />
            Repack
        </button>
    {/if}
    <button on:click={deleteSession} style="color: var(--danger)">
        <IconTrash />
        Delete
    </button>
</aside>
{#if $session != null}
    {#if $currentTab == "about"}
        <About session={$session} />
    {:else if $currentTab == "enemySets"}
        <EnemySets session={$session} />
    {:else if $currentTab == "zones"}
        <Areas session={$session} />
    {:else if $currentTab == "tasks"}
        <Tasks session={$session} />
    {:else if $currentTab == "flags"}
        <Flags session={$session} />
    {:else if $currentTab == "talkScripts"}
        <TalkScripts session={$session} />
    {/if}
{/if}

{#if repackModalOpen}
    <RepackModal on:close={() => repackModalOpen = false} />
{/if}

<style>
    aside {
        position: absolute;
        top: 0;
        left: 0;
        padding: 10px;
        height: calc(100% - 20px);
        border-right: 1px solid #444;
        background-color: #222;
        width: 200px;
        z-index: 10;

        display: flex;
        flex-direction: column;
        align-items: center;
    }
    header {
        width: calc(100% - 20px);
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 10px;
    }
    hr {
        width: calc(100% - 20px);
        border-color: #666;
        border-style: solid;
    }
    h2.sectionHeader {
        width: calc(100% - 20px);
        text-align: left;
        font-size: 0.9em;
        font-weight: bold;
        color: #999;
        margin: 5px;
        margin-top: 15px;
        text-transform: uppercase;
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
    button:active, button.active {
        background-color: #666;
        cursor: default;
    }
    :global(.loadingIcon) {
        animation: spin 2s linear infinite;
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
</style>