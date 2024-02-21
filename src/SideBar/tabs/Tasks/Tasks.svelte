<script lang="ts">
    import { fly } from "svelte/transition";
    import { IconCode, IconHelpCircleFilled, IconPlus, IconX } from "@tabler/icons-svelte";
    import "../tabs.css";
    import { cubicInOut } from "svelte/easing";
    import type Quest from "../../../_lib/Quest";
    import Task from "./Task.svelte";
    import Modal from "../../../assets/Modal.svelte";
    import { Command, TaskList } from "../../../_lib/types/QuestData";
    
    export let session: Quest;

    let helpModalOpen = false;

    function addTask() {
        let newTask = new TaskList(
            `Task ${session.questData.tasks.length}`,
            "",
            true,
            false,
            0,
            [[new Command(0, {}, 0, {})]]
        );
        session.questData.tasks = [...session.questData.tasks, newTask];
    }
</script>

<aside class="tabSidebar" transition:fly|global={{x: -200, duration: 200, easing: cubicInOut}}>
    <header>
        <IconCode />
        <div class="text">
            <h1>Tasks ({session.questData.tasks.length})</h1>
            <span>Scripts that can run game logic in real time.</span>
        </div>
        <button class="transparentBtn" style="color: white" on:click={() => helpModalOpen = true}>
            <IconHelpCircleFilled />
        </button>
    </header>
    {#each session.questData.tasks as task, i}
        <Task task={task} i={i} on:delete={() => session.questData.tasks = session.questData.tasks.filter(x => x != task)} />
    {/each}
    <button class="addBtn" on:click={addTask}>
        <IconPlus />
        Add Task
    </button>
</aside>

{#if helpModalOpen}
<Modal style="max-width: 750px" on:close={() => helpModalOpen = false}>
    <header>
        <IconCode />
        <div class="text">
            <h1>What are tasks?</h1>
        </div>
        <button class="transparentBtn" style="color: white" on:click={() => helpModalOpen = false}>
            <IconX />
        </button>
    </header>
    <p>Tasks are the main quest logic of Astral Chain. They can do hundreds of things: playing cutscenes, incrementing counters, updating story progression, and so much more.</p>
    <p>Each <b>Task</b> (shown in the list) has a set of LineLists. A <b>LineList</b> (beginning with a pink hat block) is essentially a function that can run logic.</p>
    <p>LineLists work by running in a loop until being told to stop. When a quest begins running (usually upon loading into an area), LineList 0 of each enabled quest will be ran continuously. This can be used to call other LineLists when certain conditions are met.</p>
    <p>There are two types of blocks you'll find in a LineList: <b>IF blocks</b> (orange) and <b>EXEC blocks</b> (blue).</p>
    <ul>
        <li><b>IF blocks</b> check if a certain condition is met, like checking if a set of enemies has been defeated, or if the game has progressed to a certain point. If true, anything inside the IF blocks will be ran.</li>
        <li><b>EXEC blocks</b> run logic, like setting flags, updating counters, or spawning enemies. For example, the most common EXEC block is type 2, or "Execute LineList". You can use it to run other LineLists in a Task!</li>
    </ul>
    <p>Task development is still being figured out, and there's many blocks we're unsure of. Play around and dig into how the game works!</p>
</Modal>
{/if}