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
        <div class="text">
            <h1 style="font-weight: bold">{questLookup(em.Ids[0].toString(16))}</h1>
            <span style="color: #ccc">{questLookup(em.Ids[0].toString(16), true)}</span>
        </div>
        {#if questLookup(em.Ids[0].toString(16), true)}
        <img
            width="150"
            height="150"
            src={`./icons/${questLookup(em.Ids[0].toString(16), true)}.png`}
            alt="Icon"
            on:error={(e) => e.target.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="}
        />
        {/if}
        <button class="transparentBtn" style="color: white" on:click={() => dispatch("close")}>
            <IconX />
        </button>
    </header>
    <div class="tabs">
        <button class="tab" class:active={tab === "about"} on:click={() => tab = "about"}><IconInfoCircle /></button>
        <button class="tab" class:active={tab === "setters"} on:click={() => tab = "setters"}><IconSettingsCode /></button>
        <button class="tab" class:active={tab === "extras"} on:click={() => tab = "extras"}><IconQuestionMark /></button>
    </div>
    <div class="content">
        {#if tab === "about"}
            <VectorInput
                label="Position"
                bind:value={em.Trans}
            />
            <NumberInput
                label="Rotation"
                bind:value={em.Rotation}
            />
            <VectorInput
                label="Base Rotation"
                bind:value={em.BaseRot}
            />
        {:else if tab === "extras"}
            <NumberInput
                label="ExSetTypeA"
                bind:value={em.ExSetTypeA}
            />
            <NumberInput
                label="ExSetTypeB"
                bind:value={em.ExSetTypeB}
            />
            <NumberInput
                label="ExSetTypeC"
                bind:value={em.ExSetTypeC}
            />
            <NumberInput
                label="ExSetTypeD"
                bind:value={em.ExSetTypeD}
            />
        {/if}
    </div>
</div>

<style>
    .emPopup {
        position: fixed;
        top: 32px;
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
        height: 64px;
        position: relative;
    }
    header .text {
        position: absolute;
        left: 10px;
        z-index: 1;
        filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.5));
    }
    header button {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 1;
    }
    header img {
        position: absolute;
        right: 50px;
        top: -28px;
        clip-path: polygon(0 0, 100% 0, 100% 75%, 0 75%);
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