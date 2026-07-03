<script lang="ts">
	import type { StateCommand, Script } from '../../../../_lib/types/TalkScript';
	import { IconClock } from '@tabler/icons-svelte';

	export let command: StateCommand;
	export let stateInfo: Script['stateInfos'][number];
	export let script: Script;
	export let isChoice: boolean;
	export let isAnser: boolean;
</script>

<div class="row">
	<IconClock />
	Wait
	<input type="number" placeholder="Time" bind:value={command.args[0]} /> frames ({(
		parseInt(command.args[0]) / 30
	).toFixed(2)}s)
</div>
