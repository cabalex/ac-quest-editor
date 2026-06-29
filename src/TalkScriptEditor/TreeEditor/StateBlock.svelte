<script lang="ts">
	import type { Script } from '../../_lib/types/TalkScript';
	import { IconFilter, IconPlus, IconTrash } from '@tabler/icons-svelte';
	import { StateCommand as StateCommandObject } from '../../_lib/types/TalkScript';
	import TreeCommand from './TreeCommand.svelte';

	export let script: Script;
	export let stateInfo: Script['stateInfos'][number];
</script>

<div class="state-block">
	{#each stateInfo.triggers as trigger, i}
		<div class="trigger">
			<IconFilter />
			<input type="text" placeholder="Trigger" bind:value={trigger} />
			<button
				class="deleteBtn"
				on:click={() => (stateInfo.triggers = stateInfo.triggers.filter((_, x) => x !== i))}
			>
				<IconTrash />
			</button>
		</div>
	{/each}
	<h2>
		s<input bind:value={stateInfo.number} />
		<span style="font-size: 0.8em">
			(priority
			<input bind:value={stateInfo.priority} />)
		</span>
	</h2>
	{#each stateInfo.commands as command}
		<TreeCommand
			{command}
			{stateInfo}
			{script}
			on:delete={() => (stateInfo.commands = stateInfo.commands.filter((x) => x !== command))}
		/>
	{/each}
	<button
		class="addBtn"
		on:click={() => (stateInfo.commands = [...stateInfo.commands, new StateCommandObject(0)])}
	>
		<IconPlus />
		Add Command
	</button>
</div>

<style>
	.state-block {
		border: 1px solid #555;
		border-radius: 5px;
		background-color: #222;
		display: flex;
		flex-direction: column;
		max-width: 400px;
		overflow: hidden;
		margin-bottom: 10px;
	}
	.state-block h2 {
		margin: 0;
		padding: 5px;
		background-color: #666;
	}
	.state-block h2 input {
		width: 5ch;
		padding: 0;
		border: none;
		font-size: unset;
		background-color: #444;
	}
	.trigger {
		display: flex;
		align-items: center;
		padding-left: 5px;
		border-bottom: 1px solid #555;
		background-color: #2a2a2a;
		gap: 10px;
	}
	.trigger input {
		font-size: unset;
		width: 100%;
		margin: 5px 0;
	}
	.deleteBtn {
		width: 30px;
		border-radius: 0;
		align-self: stretch;
	}
	.addBtn {
		border-radius: 0;
		padding: 5px;
		margin-bottom: 0;
	}
	.trigger .deleteBtn:not(:hover) {
		background-color: #333;
	}
</style>
