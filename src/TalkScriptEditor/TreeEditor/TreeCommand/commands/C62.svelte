<script lang="ts">
	import type { StateCommand, Script } from '../../../../_lib/types/TalkScript';
	import { IconMenu2 } from '@tabler/icons-svelte';

	export let command: StateCommand;
	export let stateInfo: Script['stateInfos'][number];
	export let script: Script;
	export let isChoice: boolean;
	export let isAnser: boolean;
</script>

<div class="row">
	<IconMenu2 />
	Open File 12 case select menu
</div>
