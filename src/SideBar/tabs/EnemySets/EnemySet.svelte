<script lang="ts">
    import { IconCaretRightFilled, IconPencil, IconTrash, IconUsers } from "@tabler/icons-svelte";
    import type { EmSet } from "../../../_lib/types/EnemySet";
    import BoolInput from "../../../assets/BoolInput.svelte";
    import TextInput from "../../../assets/TextInput.svelte";
    import NumberInput from "../../../assets/NumberInput.svelte";
    import { slide } from "svelte/transition";
    import { cubicInOut } from "svelte/easing";
    import { createEventDispatcher } from "svelte";
    import '../tabs.css';
    import { questLookup } from "../../../_lib/lookupTable";
    
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
        <IconUsers />
        <div class="text">
            <h3 translate="yes">{set.name}</h3>
        </div>
        <IconPencil />
    </header>
    <div class="ems">
        {#each set.ems as em}
            <div class="em">
                {questLookup(em.Ids[0].toString(16))}
            </div>
        {/each}
    </div>
    {#if expanded}
    <div class="content" transition:slide={{axis: 'y', duration: 100, easing: cubicInOut}}>
        <TextInput
            label="Name"
            bind:value={set.name}
        />
        <NumberInput
            label="Group Name Hash"
            description={`Current hash: 0x${set.groupNameHash.toString(16)}`}
            bind:value={set.groupNameHash}
        />
        <BoolInput
            label="Can set"
            description="Unknown purpose."
            bind:value={set.CanSet}
        />
        <TextInput
            label="Name"
            bind:value={set.name}
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
    header {
        cursor: pointer;
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
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 5px;
        border-radius: 5px;
        margin: 5px 10px;
        background-color: #333;
    }
</style>