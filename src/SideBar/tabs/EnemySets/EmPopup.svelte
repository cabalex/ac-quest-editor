<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { questLookup } from "../../../_lib/lookupTable";
    import type { Em } from "../../../_lib/types/EnemySet";
    import { fly } from "svelte/transition";
    import { cubicIn } from "svelte/easing";
    import { IconInfoCircle, IconQuestionMark, IconSettingsCode, IconX } from "@tabler/icons-svelte";
    import VectorInput from "../../../assets/VectorInput.svelte";
    import NumberInput from "../../../assets/NumberInput.svelte";

    const dispatch = createEventDispatcher();

    export let em: Em;

    let tab = "about";
</script>

<div class="emPopup" transition:fly|global={{x: -50, duration: 100, easing: cubicIn}}>
    <header>
        <div class="text" style="flex-direction: row; align-items: baseline; gap: 10px">
            <h1 style="font-weight: bold">{questLookup(em.Ids[0].toString(16))}</h1>
            <span style="color: #ccc">{em.Ids[0]}</span>
        </div>
        <button class="transparentBtn" style="color: white" on:click={() => dispatch("close")}>
            <IconX />
        </button>
    </header>
    <div class="tabs">
        <button class="tab" class:active={tab === "about"} on:click={() => tab = "about"}><IconInfoCircle /></button>
        <button class="tab" class:active={tab === "setters"} on:click={() => tab = "setters"}><IconSettingsCode /></button>
        <button class="tab" class:active={tab === "other"} on:click={() => tab = "other"}><IconQuestionMark /></button>
    </div>
    <div class="content">
        <VectorInput
            label="Position"
            bind:value={em.BaseRot}
        />
        <NumberInput
            label="Rotation"
            bind:value={em.Rotation}
        />
        <VectorInput
            label="Base Rotation"
            bind:value={em.BaseRot}
        />
    </div>
</div>

<style>
    .emPopup {
        position: fixed;
        top: 10px;
        left: 817px;
        border-radius: 10px;
        z-index: 3;
        background: #444;
        box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
        min-width: min(500px, max(200px, calc(100vw - 827px)));
    }
    header {
        background-color: var(--primary-900);
        border-radius: 10px 10px 0 0;
    }
    .tabs {
        width: 100%;
        display: flex;
        background-color: var(--primary-900);
        justify-content: stretch;
    }
    .tab {
        border-radius: 10px 10px 0 0;
        width: 100%;
        background-color: var(--primary-900);
    }
    .tab:hover {
        background-color: var(--primary-700);
    }
    .tab.active {
        background-color: #444;
    }
</style>