<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { StateCommand, Script } from '../../../_lib/types/TalkScript';
	import TextInput from '../../../assets/TextInput.svelte';
	import NumberInput from '../../../assets/NumberInput.svelte';
	import './TreeCommand.css';
	import LongTextInput from '../../../assets/LongTextInput.svelte';
	import { IconTrash } from '@tabler/icons-svelte';

	export let command: StateCommand;
	export let stateInfo: Script['stateInfos'][number];
	export let script: Script;

	const dispatch = createEventDispatcher();

	// Having all the commands in one file made it EXTREMELY
	// laggy on the Svelte interpreter, for some reason.
	// Maybe it's the icons that aren't tree-shaking?
	// import.meta.glob returns an unknown-type shape; cast to a usable record
	const commands = import.meta.glob('./commands/*.svelte', { eager: true }) as Record<string, { default: any }>;

	function getState(command: StateCommand) {
		if (command.type === 0 && (isChoiceCommand(command) || isAnserCommand(command))) {
			return command.args[2];
		}
		if (command.type === 999) {
			return command.args[0];
		}

		return '';
	}

	function isChoiceCommand(command: StateCommand) {
		let isChoice = false;
		for (const comm of stateInfo.commands) {
			if (comm === command) {
				return isChoice;
			}
			if (comm.type === 0 && comm.args[1] === 'select') {
				// select is the main one;
				// anser is used for investigation segments
				isChoice = true;
			}
		}
		return false;
	}

	function isAnserCommand(command: StateCommand) {
		let isAnser = false;
		for (const comm of stateInfo.commands) {
			if (comm === command) {
				return isAnser;
			}
			if (comm.type === 0 && comm.args[1] === 'anser') {
				// select is the main one;
				// anser is used for investigation segments
				isAnser = true;
			}
		}
		return false;
	}

	$: isChoice = isChoiceCommand(command);
	$: isAnser = isAnserCommand(command);
	$: state = getState(command);

	function confirmDelete() {
		if (confirm(`Are you sure you want to delete this command? This cannot be undone.`)) {
			dispatch('delete');
		}
	}
</script>

<div class="tree-command">
	<div
		class={'command-body ' + (state ? 'jumper ' : '') + state}
		class:choice={isChoice && command.type === 0}
		class:anser={isAnser && command.type === 0}
	>
		{#if commands[`./commands/C${command.type}.svelte`]}
			<svelte:component
				this={commands[`./commands/C${command.type}.svelte`].default}
				{command}
				{stateInfo}
				{script}
				{isChoice}
				{isAnser}
			/>
		{:else}
			<NumberInput label="Type" bind:value={command.type} />
			<TextInput label="Arg 1" bind:value={command.args[0]} />
			<TextInput label="Arg 2" bind:value={command.args[1]} />
			<TextInput label="Arg 3" bind:value={command.args[2]} />
			<LongTextInput label="Message" bind:value={command.message} />
		{/if}

		<div class="small-args">
			<input type="number" style="width: 3ch" placeholder="Type" bind:value={command.type} />
			<input type="text" placeholder="Arg 1" bind:value={command.args[0]} />
			<input type="text" placeholder="Arg 2" bind:value={command.args[1]} />
			<input type="text" placeholder="Arg 3" bind:value={command.args[2]} />
		</div>
	</div>
	<button class="deleteBtn" on:click={confirmDelete}>
		<IconTrash />
	</button>
</div>

<style>
	.small-args {
		display: flex;
	}
	.small-args input {
		width: 100%;
		font-size: 10px;
		padding: 2px;
		border-radius: 0;
		background-color: #222;
		border: 1px solid #333;
		border-top-color: #2a2a2a;
		color: #aaa;
	}
	.small-args input[type='number'] {
		-webkit-appearance: none;
		-moz-appearance: textfield;

		appearance: textfield;
	}

	.small-args input[type='number']::-webkit-outer-spin-button,
	.small-args input[type='number']::-webkit-inner-spin-button {
		-webkit-appearance: none;
	}
	.deleteBtn {
		width: 30px;
		border-radius: 0;
		align-self: stretch;
	}
	.deleteBtn:not(:hover) {
		background-color: #333;
	}
</style>
