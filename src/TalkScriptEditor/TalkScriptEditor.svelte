<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';
	import type { Script } from '../_lib/types/TalkScript';
	import RawEditor from './RawEditor/RawEditor.svelte';
	import TreeEditor from './TreeEditor/TreeEditor.svelte';

	export let script: Script;

	let mode = 'tree';
</script>

<div class="taskEditor" transition:fly|global={{ duration: 200, x: 200, easing: cubicInOut }}>
	<div class="mode">
		<button on:click={() => (mode = 'tree')} class:active={mode === 'tree'}>Tree</button>
		<button on:click={() => (mode = 'raw')} class:active={mode === 'raw'}>Raw</button>
	</div>
	{#if mode === 'raw'}
		<RawEditor bind:script />
	{:else}
		<TreeEditor bind:script />
	{/if}
</div>

<style>
	.taskEditor {
		position: fixed;
		right: 10px;
		top: 10px;
		height: calc(100% - 40px);
		width: calc(100% - 736px);
		z-index: 6;
		border-radius: 10px;
		background-color: #444;
		overflow-y: auto;

		padding: 10px;
	}
	.mode {
		position: absolute;
		top: 10px;
		right: 10px;
		display: flex;
		border: 1px solid #aaa;
		background-color: #555;
		padding: 5px;
		gap: 5px;
		border-radius: 5px;
	}
	.mode button {
		padding: 10px;
	}
	.mode button.active {
		background-color: #666;
	}
	.mode button:not(.active):not(:hover) {
		color: #aaa;
	}
</style>
