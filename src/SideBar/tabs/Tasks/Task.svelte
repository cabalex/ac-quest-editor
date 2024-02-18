<script lang="ts">
    import { IconCaretRightFilled, IconCodeAsterix, IconCodeDots, IconCodePlus, IconPencil, IconTrash } from "@tabler/icons-svelte";
    import type { TaskList } from "../../../_lib/types/QuestData";
    import BoolInput from "../../../assets/BoolInput.svelte";
    import { slide } from "svelte/transition";
    import { cubicInOut } from "svelte/easing";
    import { createEventDispatcher } from "svelte";
    import TextInput from "../../../assets/TextInput.svelte";
    import NumberInput from "../../../assets/NumberInput.svelte";
    import { currentTask } from "../../../store";
    
    export let task: TaskList;
    export let i: number;

    let expanded = false;

    const dispatch = createEventDispatcher();

    function confirmDelete() {
        if (confirm(`Are you sure you want to delete Task ${task.name}? This cannot be undone.`)) {
            dispatch("delete", task);
        }
    }
</script>

<div
    class="taskList"
    class:open={expanded}
    class:active={$currentTask == i}
    role="button"
    tabindex="0"
    on:click={() => $currentTask = i}
>
    <header>
        <button class="expand" class:active={expanded} on:click={(e) => { expanded = !expanded; e.stopPropagation(); }}>
            <IconCaretRightFilled />
        </button>
        {#if !task.enabled}
            <IconCodeAsterix color="var(--danger)" />
        {:else if task.workInAdvance}
            <IconCodePlus color="var(--primary-300)" />
        {:else}
            <IconCodeDots />
        {/if}
        <div class="text">
            <h3 translate="yes">{task.name}</h3>
            {#if task.templateName}
                <span translate="yes">{task.templateName}</span>
            {/if}
        </div>
        <IconPencil />
    </header>
    {#if expanded}
    <div class="content" transition:slide={{axis: 'y', duration: 100, easing: cubicInOut}}>
        <BoolInput
            label="Enabled"
            description="Runs LineList 0 of this Task continuously. If disabled, the Task must be called from another Task to be ran."
            bind:value={task.enabled}
        />
        <BoolInput
            label="Runs in advance"
            description="Prioritizes this script over regular scripts."
            bind:value={task.workInAdvance}
        />
        <TextInput
            label="Name"
            bind:value={task.name}
        />
        <TextInput
            label="Template name"
            bind:value={task.templateName}
        />
        <NumberInput
            label="Task color"
            description="Not sure what this does."
            bind:value={task.TaskColor}
        />
        <button class="deleteBtn" on:click={confirmDelete}>
            <IconTrash />
            Delete task
        </button>
    </div>
    {/if}
</div>

<style>
    header {
        cursor: pointer;
        transition: 0.1s ease-in-out;
        border-radius: 10px 10px;
    }
    .content {
        border-top: 1px solid #333;
    }
    .taskList {
        width: calc(100% - 10px);
        background-color: #444;
        margin: 5px;
        border-radius: 10px;
    }
    .taskList.active header {
        background-color: #666;
    }
    .taskList.open header {
        border-radius: 10px 10px 0 0;
    }
    .text > * {
        margin: 0;
    }
    button.expand {
        padding: 5px;
        border-radius: 100%;
        transition: transform 0.1s;
    }
    button.expand.active {
        transform: rotate(90deg);
    }
    button.deleteBtn {
        width: 100%;
        padding: 10px;
        border-radius: 0 0 10px 10px;
        color: var(--danger);
        transition: 0.2s;
    }
    button.deleteBtn:hover {
        background-color: var(--danger);
        color: white;
    }
</style>