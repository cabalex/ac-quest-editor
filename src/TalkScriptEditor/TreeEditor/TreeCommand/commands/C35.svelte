<script lang="ts">
	import type { StateCommand, Script } from '../../../../_lib/types/TalkScript';
	import { IconMusic } from '@tabler/icons-svelte';

	export let command: StateCommand;
	export let stateInfo: Script['stateInfos'][number];
	export let script: Script;
	export let isChoice: boolean;
	export let isAnser: boolean;
</script>

<!-- Play sound -->
<div class="row">
	<IconMusic />
	Play sound <input type="text" placeholder="Sound ID" bind:value={command.args[0]} />
</div>
