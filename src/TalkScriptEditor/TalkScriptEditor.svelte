<script lang="ts">
    import { fly } from "svelte/transition";
    import { cubicInOut } from "svelte/easing";
    import type { Script } from "../_lib/types/TalkScript";
    import StateCommand from "./StateCommand.svelte";
    import { IconPlus, IconTrash } from "@tabler/icons-svelte";
    import { StateCommand as StateCommandObject, StateInfo } from "../_lib/types/TalkScript";
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
        <h2 class="sectionHeader">Triggers</h2>
        {#each stateInfo.triggers as trigger, i}
            <div class="trigger">
                <button class="deleteBtn" on:click={() => stateInfo.triggers = stateInfo.triggers.filter((_, x) => x !== i)}>
                    <IconTrash />
                </button>
                <TextInput label="Trigger" bind:value={trigger} />
            </div>
        {/each}
        <button class="addBtn addTrigger" on:click={() => stateInfo.triggers = [...stateInfo.triggers, ""]}>
            <IconPlus />
            Add Trigger
        </button>
        {#each stateInfo.commands as command}
            <StateCommand command={command} script={script} on:delete={() => stateInfo.commands = stateInfo.commands.filter(x => x !== command)} />
        {/each}
        <button class="addBtn" on:click={() => stateInfo.commands = [...stateInfo.commands, new StateCommandObject(0)]}>
            <IconPlus />
            Add Command
        </button>
    {/each}
    <button class="addBtn" on:click={() => script.stateInfos = [...script.stateInfos, new StateInfo(["none"], 1, 1, [])]}>
        <IconPlus />
        Add State
    </button>
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
    .trigger {
        display: flex;
        gap: 10px;
        background-color: #333;
        padding: 10px;
        border-radius: 5px;
        max-width: 500px;
        margin-top: 10px;
    }
    .trigger .deleteBtn {
        width: 40px;
    }
    .addTrigger {
        margin-bottom: 30px;
        width: 520px;
        padding: 10px;
    }
</style>