<script lang="ts">
	import type { Script } from '../../_lib/types/TalkScript';
	import { IconPlus } from '@tabler/icons-svelte';
	import { StateInfo } from '../../_lib/types/TalkScript';
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
<button
	class="addBtn floating"
	on:click={() => (script.stateInfos = [...script.stateInfos, new StateInfo(['none'], 1, 1, [])])}
>
	<IconPlus />
	Add State
</button>

<style>
	.canvas {
		width: 100%;
		height: 100%;
		overflow: auto;
	}
	.state-row {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		justify-content: flex-start;
		gap: 10px;
	}
	.addBtn.floating {
		width: fit-content;
		position: absolute;
		bottom: 20px;
		right: 20px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
	}
</style>
