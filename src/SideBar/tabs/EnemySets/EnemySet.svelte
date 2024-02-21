<script lang="ts">
    import { IconCaretRightFilled, IconTrash, IconUsers, IconUser, IconChevronRight } from "@tabler/icons-svelte";
    import type { EmSet } from "../../../_lib/types/EnemySet";
    import BoolInput from "../../../assets/BoolInput.svelte";
    import TextInput from "../../../assets/TextInput.svelte";
    import NumberInput from "../../../assets/NumberInput.svelte";
    import { slide } from "svelte/transition";
    import { cubicInOut } from "svelte/easing";
    import { createEventDispatcher } from "svelte";
    import '../tabs.css';
    import { questLookup } from "../../../_lib/lookupTable";
    import { currentEm } from "../../../store";
    
    export let set: EmSet;

    let expanded = false;

    const dispatch = createEventDispatcher();

    function confirmDelete() {
        if (confirm(`Are you sure you want to delete Task ${set.name}? This cannot be undone.`)) {
            dispatch("delete", set);
        }
    }
</script>

<div class="emSets">
    <header>
        <button class="expand" class:active={expanded} on:click={() => expanded = !expanded}>
            <IconCaretRightFilled />
        </button>
        <span class="iconNumber">
            {set.number}
            <IconUsers />
        </span>
        <div class="text">
            <h3 translate="yes">{set.name}</h3>
        </div>
    </header>
    <div class="ems">
        {#each set.ems as em}
            <button class="em" class:active={$currentEm == em} on:click={() => $currentEm = em}>
                <IconUser />
                <span>{questLookup(em.Ids[0].toString(16))}</span>
                <IconChevronRight />
            </button>
        {/each}
    </div>
    {#if expanded}
    <div class="content" transition:slide={{axis: 'y', duration: 100, easing: cubicInOut}}>
        <NumberInput
            label="Set Number"
            description={"Must be exclusive."}
            bind:value={set.number}
        />
        <TextInput
            label="Name"
            bind:value={set.name}
        />
        <BoolInput
            label="Can set"
            description="Unknown purpose."
            bind:value={set.CanSet}
        />
        <h2 class="sectionHeader" style="padding-left: 10px">Difficulties (unknown purpose, usually blank)</h2>
        <TextInput
            label="Easy"
            bind:value={set.easy}
        />
        <TextInput
            label="Normal"
            bind:value={set.normal}
        />
        <TextInput
            label="Hard"
            bind:value={set.hard}
        />
        <TextInput
            label="Very Hard"
            bind:value={set.very_hard}
        />
        <button class="deleteBtn" on:click={confirmDelete}>
            <IconTrash />
            Delete set
        </button>
    </div>
    {/if}
</div>

<style>
    .iconNumber {
        display: flex;
        align-items: center;
        font-size: 20px;
        gap: 5px;
        font-weight: bold;
    }
    .content {
        border-top: 1px solid #333;
    }
    .emSets {
        width: calc(100% - 10px);
        background-color: #444;
        margin: 5px;
        border-radius: 10px;
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
    .em {
        width: calc(100% - 20px);
        padding: 5px;
        margin: 5px 10px;
        background-color: #333;
        background: linear-gradient(90deg, #333 50%, #555 100%, #555) #333;
        background-repeat: no-repeat;
        background-position-x: 500px;
        transition: background-position 0.1s ease-in-out, background-color 0.1s ease-in-out;
    }
    .em:hover:not(.active) {
        background-position-x: 0;
    }
    button.em span {
        flex-grow: 1;
        text-align: left;
    }
    button.em.active {
        background-color: #555;
    }
</style>