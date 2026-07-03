<script lang="ts">
	import type { StateCommand, Script } from '../../../../_lib/types/TalkScript';

	export let command: StateCommand;
	export let stateInfo: Script['stateInfos'][number];
	export let script: Script;
	export let isChoice: boolean;
	export let isAnser: boolean;
</script>

<div class="row">Add pin to map</div>
