<script lang="ts">
	import type { StateCommand, Script } from '../../../../_lib/types/TalkScript';
	import { IconArrowUpRight, IconCircleDashedX } from '@tabler/icons-svelte';

	export let command: StateCommand;
	export let stateInfo: Script['stateInfos'][number];
	export let script: Script;
	export let isChoice: boolean;
	export let isAnser: boolean;

	$: eligibleStateInfos = script.stateInfos.map((x) => `s${x.number}`);
</script>

<div class="row">
	{#if command.args[1] === 'run'}
		<IconArrowUpRight />
		Jump to
	{:else}
		<IconCircleDashedX />
		End dialogue; start again at
	{/if}
	{#if eligibleStateInfos.includes(command.args[0])}
		<select bind:value={command.args[0]}>
			{#each eligibleStateInfos as stateInfo}
				<option value={stateInfo}>{stateInfo}</option>
			{/each}
		</select>
	{:else}
		<input type="text" placeholder="Jump to" bind:value={command.args[0]} />
	{/if}
</div>
{#if command.args[2]}
	<!-- Jump only if condition is true -->
	<div class="row">
		only if
		<input type="text" placeholder="Condition" bind:value={command.args[2]} />
	</div>
{/if}
