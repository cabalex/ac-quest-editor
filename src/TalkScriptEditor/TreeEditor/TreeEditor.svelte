<script lang="ts">
	import type { Script } from '../../_lib/types/TalkScript';
	import { IconFilter, IconPlus, IconTrash } from '@tabler/icons-svelte';
	import StateCommand from '../RawEditor/StateCommand.svelte';
	import { StateCommand as StateCommandObject } from '../../_lib/types/TalkScript';
	import TreeCommand from './TreeCommand.svelte';
	import StateBlock from './StateBlock.svelte';

	export let script: Script;

	let canvas: HTMLDivElement;

	$: numbers = [...new Set(script.stateInfos.map((x) => x.number))].sort((a, b) => a - b);
</script>

<div class="canvas" bind:this={canvas}>
	{#each numbers as number}
		<div class="state-row">
			{#each script.stateInfos.filter((x) => x.number === number) as stateInfo}
				<StateBlock {script} {stateInfo} />
			{/each}
		</div>
	{/each}
</div>

<style>
	.state-row {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		justify-content: flex-start;
		gap: 10px;
	}
</style>
