<script lang="ts">
	import type { StateCommand, Script } from '../../../../_lib/types/TalkScript';
	import { IconCamera } from '@tabler/icons-svelte';

	export let command: StateCommand;
	export let stateInfo: Script['stateInfos'][number];
	export let script: Script;
	export let isChoice: boolean;
	export let isAnser: boolean;
</script>

<div class="row">
	<IconCamera />
	Point camera at
	<input type="text" placeholder="Jump to" bind:value={command.args[1]} />
</div>
<div class="row">
	from position <input type="text" placeholder="From position" bind:value={command.args[0]} />
</div>
<div class="row">
	with zoom (optional) <input type="text" placeholder="Zoom level" bind:value={command.args[2]} />
</div>
