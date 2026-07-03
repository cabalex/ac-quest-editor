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
	Set camera mode to
	<select bind:value={command.args[0]}>
		<option value="" disabled></option>
		<option value="normal">Normal</option>
		<option value="free">Free</option>
		<option value="back">Back</option>
		<option value="pl">PL</option>
		<option value="pl_face">PL (Face)</option>
		<option value="pl_squat">PL (Squat)</option>
		<option value="target">Target</option>
		<option value="target_face">Target (Face)</option>
	</select>
</div>
{#if command.args[0] === 'free'}
	<div class="row">
		with position <input type="text" placeholder="Position" bind:value={command.args[1]} />
	</div>
	<div class="row">
		facing location <input type="text" placeholder="Target location" bind:value={command.args[2]} />
	</div>
{:else}
	<div class="row">
		with zoom (optional) <input type="text" placeholder="Zoom level" bind:value={command.args[1]} />
	</div>
{/if}
