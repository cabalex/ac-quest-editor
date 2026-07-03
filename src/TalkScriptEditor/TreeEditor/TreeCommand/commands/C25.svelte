<script lang="ts">
	import type { StateCommand, Script } from '../../../../_lib/types/TalkScript';
	import { IconWashDryShade } from '@tabler/icons-svelte';

	export let command: StateCommand;
	export let stateInfo: Script['stateInfos'][number];
	export let script: Script;
	export let isChoice: boolean;
	export let isAnser: boolean;
</script>

<div class="row">
	<IconWashDryShade />
	Fade out for <input type="text" placeholder="Arg 1" bind:value={command.args[0]} /> frames ({(
		parseInt(command.args[0]) / 30
	).toFixed(2)}s)
</div>
