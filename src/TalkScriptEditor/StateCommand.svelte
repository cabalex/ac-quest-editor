<script lang="ts">
    import type { StateCommand, Script } from "../_lib/types/TalkScript";
    import TextInput from "../assets/TextInput.svelte";
    import NumberInput from "../assets/NumberInput.svelte";

    export let command: StateCommand;
    export let script: Script;
</script>

<div class="command">
    {#if command.type === 0}
        <h2 class="sectionHeader">Play textbox message</h2>
        <TextInput
            label="Modifier"
            description="Optional."
            bind:value={command.args[0]}
        />
        <TextInput
            label="Visibility options"
            description="Optional."
            bind:value={command.args[1]}
        />
        <TextInput
            label="Comment"
            description="Optional."
            bind:value={command.args[2]}
        />
        <TextInput
            label="Say message"
            bind:value={command.message}
        />
    {:else if command.type === 1}
        <h2 class="sectionHeader">Play gameplay message</h2>
        <TextInput
            label="Volume/Sound details"
            description="Optional."
            bind:value={command.args[0]}
        />
        <TextInput
            label="Player location"
            description="Optional."
            bind:value={command.args[1]}
        />
        <TextInput
            label="Comment"
            description="Optional."
            bind:value={command.args[2]}
        />
        <TextInput
            label="Say message"
            bind:value={command.message}
        />
    {:else if command.type === 999}
        <h2 class="sectionHeader">Return</h2>
        <TextInput
            label="Jump location (state)"
            bind:value={command.args[0]}
        />
        <TextInput
            label="Run? (optional)"
            bind:value={command.args[1]}
        />
        <TextInput
            label="Jump if flag is true (optional)"
            bind:value={command.args[2]}
        />
    {:else}
        <h2 class="sectionHeader">unknown arg {command.type}</h2>
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
    {/if}
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
    :global(.command .input) {
        flex-direction: column;
        align-items: left;
    }
    :global(.command .input .text) {
        flex-direction: row;
        gap: 5px;
        flex-wrap: wrap;
        margin: 0;
    }
    .sectionHeader {
        margin-top: 5px;
    }
</style>