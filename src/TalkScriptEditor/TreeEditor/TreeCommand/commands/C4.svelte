<script lang="ts">
	import type { StateCommand, Script } from '../../../../_lib/types/TalkScript';
	import { IconFlagOff } from '@tabler/icons-svelte';

	export let command: StateCommand;
	export let stateInfo: Script['stateInfos'][number];
	export let script: Script;
	export let isChoice: boolean;
	export let isAnser: boolean;
</script>

<!-- Set global/save/quest flag to false -->
<div class="row">
	<IconFlagOff />
	Set Global flag
	<input type="text" placeholder="Flag name" bind:value={command.args[0]} /> to false
</div>
