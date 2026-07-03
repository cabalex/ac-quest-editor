<script lang="ts">
	import type { StateCommand, Script } from '../../../../_lib/types/TalkScript';
	import { IconMessage } from '@tabler/icons-svelte';

	export let command: StateCommand;
	export let stateInfo: Script['stateInfos'][number];
	export let script: Script;
	export let isChoice: boolean;
	export let isAnser: boolean;
</script>

<!-- Say a non-blocking message -->
<div class="row">
	<IconMessage />
	Say message (non-blocking?)
</div>
<div class="row">
	<textarea placeholder="Say message" bind:value={command.message} />
</div>
