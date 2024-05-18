<script lang="ts">
    import { fly } from "svelte/transition";
    import { IconHelpCircleFilled, IconMessage, IconPlus, IconScript, IconX } from "@tabler/icons-svelte";
    import "../tabs.css";
    import { cubicInOut } from "svelte/easing";
    import type Quest from "../../../_lib/Quest";
    import Script from "./Script.svelte";
    import TalkScript, { Script as ScriptObject } from "../../../_lib/types/TalkScript";
  import Modal from "../../../assets/Modal.svelte";
    
    export let session: Quest;

    function addTalkScript(objId: string, triggerType: number) {
        if (!session.talkScript) session.talkScript = new TalkScript([]);
        session.talkScript.scripts = [...session.talkScript?.scripts, new ScriptObject(objId, 0, "qffff", triggerType)];
    }

    let helpModalOpen = false;
</script>

<aside class="tabSidebar" transition:fly|global={{x: -200, duration: 200, easing: cubicInOut}}>
    <header>
        <IconMessage />
        <div class="text">
            <h1>TalkScripts</h1>
            <span>Dialogue players can see and hear. Referenced by Tasks.</span>
        </div>
        <button class="transparentBtn" style="color: white" on:click={() => helpModalOpen = true}>
            <IconHelpCircleFilled />
        </button>
    </header>
    {#if session.talkScript && session.talkScript.scripts.length > 0}
        <h2 class="sectionHeader">Triggered by talking to NPC</h2>
        {#if session.talkScript.scripts.filter(x => x.triggerType == 0).length === 0}
            <p>No Talk Scripts are triggered by talking to an NPC.</p>
        {/if}
        {#each session.talkScript.scripts.filter(x => x.triggerType == 0) as script}
            <Script script={script} on:delete={() => { if (session.talkScript) session.talkScript.scripts = session.talkScript.scripts.filter(x => x != script)} } />
        {/each}
        <button class="addBtn" on:click={addTalkScript.bind(null, "0x0000", 0)}>
            <IconPlus />
            Add Interaction TalkScript
        </button>
        <h2 class="sectionHeader">Triggered by Task</h2>
        {#if session.talkScript.scripts.filter(x => x.triggerType == 1).length === 0}
            <p>No scripts are triggered by Tasks.</p>
        {/if}
        {#each session.talkScript.scripts.filter(x => x.triggerType == 1) as script}
            <Script script={script} on:delete={() => { if (session.talkScript) session.talkScript.scripts = session.talkScript.scripts.filter(x => x != script)} } />
        {/each}
        <button class="addBtn" on:click={addTalkScript.bind(null, "0x0000", 1)}>
            <IconPlus />
            Add Task TalkScript
        </button>
        <h2 class="sectionHeader">Triggered by Speech Bubble</h2>
        {#if session.talkScript.scripts.filter(x => x.triggerType == 2).length === 0}
            <p>No NPC speech bubbles exist in this Quest.</p>
        {/if}
        {#each session.talkScript.scripts.filter(x => x.triggerType == 2) as script}
            <Script script={script} on:delete={() => { if (session.talkScript) session.talkScript.scripts = session.talkScript.scripts.filter(x => x != script)} } />
        {/each}
        <button class="addBtn" on:click={addTalkScript.bind(null, "0x0000", 2)}>
            <IconPlus />
            Add Speech Bubble TalkScript
        </button>
    {:else}
        <div class="talkScriptSplash">
            <div class="text">
                <IconScript size={36} />
                <p>TalkScripts are how players interact with NPCs, allowing for dialogue choices, camera movements, emotes, and more.</p>
            </div>
            <button class="addBtn" style="margin: 0" on:click={addTalkScript.bind(null, "0x0000", 1)}>
                <IconPlus />
                Add TalkScript to this Quest
            </button>
        </div>
    {/if}
</aside>

{#if helpModalOpen}
<Modal style="max-width: 750px" on:close={() => helpModalOpen = false}>
    <header>
        <IconMessage />
        <div class="text">
            <h1>What are Talk Scripts?</h1>
        </div>
        <button class="transparentBtn" style="color: white" on:click={() => helpModalOpen = false}>
            <IconX />
        </button>
    </header>
    <p>Talk Scripts are how players interact with NPCs in Astral Chain. They can do as much as provide rich dialogue choices for the player to choose, to as little as displaying a speech bubble over someone's head.</p>
    <p>There are three ways a Talk Script can be triggered:</p>
    <ul>
        <li><b>Through NPC Interaction</b>: Pressing A on the target NPC will trigger this Talk Script.</li>
        <li><b>Through a Task</b>: A Task can trigger a Talk Script to run via its hexadecimal ID.</li>
        <li><b>Through a Speech Bubble</b>: A speech bubble will appear over the target NPC's head, displaying conversation that doesn't need to interrupt gameplay.</li>
    </ul>
    <p><b>NPC interaction and Speech Bubble TalkScripts can only be set on PL objects (e.g. PL2009, an NPC), not EMs.</b> You can't talk to chimeras :(</p>
</Modal>
{/if}

<style>
    .talkScriptSplash {
        background-color: #111;
        border-radius: 10px;
        padding: 10px;
        margin: 5px;

        display: flex;
        flex-direction: column;
        position: relative;
    }
    .talkScriptSplash .text {
        display: flex;
        align-items: center;
        gap: 10px;
    }
</style>