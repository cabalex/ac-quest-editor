<script lang="ts">
	import type { StateCommand, Script } from '../../../../_lib/types/TalkScript';
	import { IconMessage2 } from '@tabler/icons-svelte';

	export let command: StateCommand;
	export let stateInfo: Script['stateInfos'][number];
	export let script: Script;
	export let isChoice: boolean;
	export let isAnser: boolean;
</script>

<!-- Display a message above the NPC's head-->
<div class="row">
	<IconMessage2 />
	<textarea class="above-head" placeholder="Say message above head" bind:value={command.message} />
</div>
