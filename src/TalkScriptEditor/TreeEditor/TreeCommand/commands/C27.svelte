<script lang="ts">
	import type { StateCommand, Script } from '../../../../_lib/types/TalkScript';
	import { IconCircleOff } from '@tabler/icons-svelte';

	export let command: StateCommand;
	export let stateInfo: Script['stateInfos'][number];
	export let script: Script;
	export let isChoice: boolean;
	export let isAnser: boolean;
</script>

<div class="row">
	<IconCircleOff />
	Prevent dialogue from being skipped
</div>
<div class="row">
	{#if command.args[0] === 'notalkskip'}
		until end of dialogue (notalkskip)
	{:else}
		for <input type="text" placeholder="Frames" bind:value={command.args[0]} /> frames ({command
			.args[0] === ''
			? 'indefinitely'
			: (parseInt(command.args[0]) / 30).toFixed(2) + 's'})
	{/if}
</div>
