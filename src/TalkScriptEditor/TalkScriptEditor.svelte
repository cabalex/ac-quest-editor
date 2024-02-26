<script lang="ts">
    import { fly } from "svelte/transition";
    import { cubicInOut } from "svelte/easing";
    import type { Script } from "../_lib/types/TalkScript";
    import StateCommand from "./StateCommand.svelte";
    import { IconPlus } from "@tabler/icons-svelte";
    import { StateCommand as StateCommandObject } from "../_lib/types/TalkScript";
    import TextInput from "../assets/TextInput.svelte";
    import NumberInput from "../assets/NumberInput.svelte";

    export let script: Script;
</script>

<div class="taskEditor" transition:fly|global={{duration: 200, x: 200, easing: cubicInOut}}>
    <header>
        <h2>TalkScript Editor (BETA)</h2>
    </header>
    {#each script.stateInfos as stateInfo}
        <h2 class="stateInfoHeader">State {stateInfo.number}</h2>
        <NumberInput label="State No" bind:value={stateInfo.number} />
        <NumberInput label="Priority" bind:value={stateInfo.priority} />
        {#each stateInfo.triggers as trigger}
            <TextInput label="Trigger" bind:value={trigger} />
        {/each}
        {#each stateInfo.commands as command}
            <StateCommand command={command} script={script} />
        {/each}
        <button class="addBtn" on:click={() => stateInfo.commands = [...stateInfo.commands, new StateCommandObject(0)]}>
            <IconPlus />
            Add Command
        </button>
    {/each}
</div>
  
<style>
    .taskEditor {
        position: fixed;
        right: 10px;
        top: 10px;
        height: calc(100% - 40px);
        width: calc(100% - 846px);
        z-index: 6;
        border-radius: 10px;
        background-color: #444;
        overflow-y: auto;

        padding: 10px;
    }
    .stateInfoHeader {
        margin-left: 20px;
    }
</style>