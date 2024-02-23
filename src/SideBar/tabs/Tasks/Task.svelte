<script lang="ts">
    import { IconCaretRightFilled, IconCheck, IconCodeAsterix, IconCodeDots, IconCodePlus, IconPencil, IconTrash } from "@tabler/icons-svelte";
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
        if (confirm(`Are you sure you want to delete ${task.name}? This cannot be undone.`)) {
            dispatch("delete", task);
            if ($currentTask === i) $currentTask = null;
        }
    }

    const colors = [
        "white",
        "#EF5350", // red
        "#FFA726", // orange
        "#FFEE58", // yellow
        "#66BB6A", // green
        "#42A5F5", // blue
        "#AB47BC", // purple
    ]
</script>

<div
    class="taskList"
    class:open={expanded}
    class:active={$currentTask == i}
    role="button"
    tabindex="0"
    on:click={() => $currentTask = $currentTask === i ? null : i}
    transition:slide={{duration: 100, easing: cubicInOut}}
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
        <IconPencil color={colors[task.color] || "white"} />
    </header>
    {#if expanded}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="content" transition:slide={{axis: 'y', duration: 100, easing: cubicInOut}} on:click={(e) => e.stopPropagation()}>
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
        <h2 class="sectionHeader">Cosmetic Color</h2>
        <div class="taskColor">
            {#each colors as color, i}
                <button
                    class="color"
                    class:active={task.color === i}
                    style={`background-color: ${color}; border-color: ${color}`}
                    on:click={() => task.color = i}
                >
                {#if task.color === i}
                    <IconCheck color="black" />
                {/if} 
                </button>
            {/each}
        </div>
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
    .content h2.sectionHeader {
        padding-left: 10px;
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
    .taskColor {
        display: flex;
        gap: 5px;
        margin: 10px 20px
    }
    .taskColor .color {
        width: 100%;
        height: 36px;
        border-radius: 24px;
        padding: 0;
        border-width: 2px;
        border-style: solid;
    }
    .taskColor .color:not(.active):not(:hover) {
        border-color: #222 !important;
    }
</style>