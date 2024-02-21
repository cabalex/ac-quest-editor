<script lang="ts">
    import { IconCaretRightFilled, IconMapPin, IconTrash } from "@tabler/icons-svelte";
    import type { Area } from "../../../_lib/types/QuestData";
    import BoolInput from "../../../assets/BoolInput.svelte";
    import { slide } from "svelte/transition";
    import { cubicInOut } from "svelte/easing";
    import { createEventDispatcher } from "svelte";
    import NumberInput from "../../../assets/NumberInput.svelte";
    import VectorInput from "../../../assets/VectorInput.svelte";
    
    export let area: Area;
    export let i: number;

    let expanded = false;

    let isSphere = area.type === 2;
    $: area.type = isSphere ? 2 : 1;

    const dispatch = createEventDispatcher();

    function confirmDelete() {
        if (confirm(`Are you sure you want to delete Area ${area.index}? This cannot be undone.`)) {
            dispatch("delete", area);
        }
    }
</script>

<div
    class="area"
    class:open={expanded}
    transition:slide={{duration: 100, easing: cubicInOut}}
>
    <header>
        <button class="expand" class:active={expanded} on:click={(e) => { expanded = !expanded; e.stopPropagation(); }}>
            <IconCaretRightFilled />
        </button>
        <IconMapPin />
        <div class="text">
            <h3>Area {area.index}</h3>
            <span>{isSphere ? "Sphere" : "Box"}</span>
        </div>
    </header>
    {#if expanded}
    <div class="content" transition:slide={{axis: 'y', duration: 100, easing: cubicInOut}}>
        <NumberInput
            label="Area ID"
            bind:value={area.index}
        />
        <BoolInput
            label="Spherical area"
            bind:value={isSphere}
        />
        <div class="nested">
            <VectorInput
                label="Center"
                bind:value={area.center}
            />
            <NumberInput
                label="Height"
                bind:value={area.height}
            />
            <hr />
            {#if isSphere}
            <NumberInput
                label="Radius"
                bind:value={area.radius}
            />
            {:else}
            <VectorInput
                label="Point 1"
                bind:value={area.points[0]}
            />
            <hr />
            <VectorInput
                label="Point 2"
                bind:value={area.points[1]}
            />
            <hr />
            <VectorInput
                label="Point 3"
                bind:value={area.points[2]}
            />
            <hr />
            <VectorInput
                label="Point 4"
                bind:value={area.points[3]}
            />
            {/if}
            <BoolInput
                label="Debug display"
                description="Does nothing."
                bind:value={area.debugDisplay}
            />
        </div>
        <button class="deleteBtn" on:click={confirmDelete}>
            <IconTrash />
            Delete Area
        </button>
    </div>
    {/if}
</div>

<style>
    header {
        transition: 0.1s ease-in-out;
        border-radius: 10px 10px;
    }
    .content {
        border-top: 1px solid #333;
    }
    .area {
        width: calc(100% - 10px);
        background-color: #444;
        margin: 5px;
        border-radius: 10px;
    }
    .area.open header {
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