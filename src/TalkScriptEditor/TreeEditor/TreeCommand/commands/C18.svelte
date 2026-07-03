<script lang="ts">
	import type { StateCommand, Script } from '../../../../_lib/types/TalkScript';
	import { IconMoodSmile } from '@tabler/icons-svelte';

	export let command: StateCommand;
	export let stateInfo: Script['stateInfos'][number];
	export let script: Script;
	export let isChoice: boolean;
	export let isAnser: boolean;
</script>

<!-- Emote the NPC (or player with pl)-->
<div class="row">
	<IconMoodSmile />
	Have <input type="text" placeholder="Item ID" bind:value={command.args[1]} /> emote
	<input type="text" placeholder="Emote ID" bind:value={command.args[0]} />
</div>
