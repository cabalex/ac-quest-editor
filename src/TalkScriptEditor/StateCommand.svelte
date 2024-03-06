<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import type { StateCommand, Script } from "../_lib/types/TalkScript";
    import TextInput from "../assets/TextInput.svelte";
    import NumberInput from "../assets/NumberInput.svelte";
  import { IconTrash } from "@tabler/icons-svelte";

    export let command: StateCommand;
    export let script: Script;

    const dispatch = createEventDispatcher();

    function confirmDelete() {
        if (confirm(`Are you sure you want to delete this command? This cannot be undone.`)) {
            dispatch("delete");
        }
    }
</script>

<div class="command">
    <button class="deleteBtn" on:click={confirmDelete}>
        <IconTrash />
    </button>
    <NumberInput
        label="Type"
        bind:value={command.type}
    />
    <TextInput
        label="Arg 1"
        bind:value={command.args[0]}
    />
    <TextInput
        label="Arg 2"
        bind:value={command.args[1]}
    />
    <TextInput
        label="Arg 3"
        bind:value={command.args[2]}
    />
    <TextInput
        label="Message"
        bind:value={command.message}
    />
</div>

<style>
    .command {
        background-color: #111;
        padding: 5px;
        border-radius: 5px;
        margin: 5px;

        display: flex;
        flex-direction: row;
        align-items: center;
    }
    .deleteBtn {
        padding: 5px;
        align-self: stretch;
        border-radius: 5px;
        width: 40px;
        margin-right: 5px;
    }
    :global(.command .input) {
        flex-direction: column;
        align-items: flex-start;
    }
    :global(.command .input .text) {
        flex-direction: row;
        gap: 5px;
        flex-wrap: wrap;
        margin: 0;
    }
    :global(.command input) {
        width: calc(100% - 10px);
    }
    :global(.command *:last-child input) {
        width: 25ch;
    }
    :global(.command > *:nth-child(2)) {
        width: 60px;
        flex-grow: 0;
        flex-shrink: 0;
    }
</style>