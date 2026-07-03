<script lang="ts">
	import type { StateCommand, Script } from '../../../../_lib/types/TalkScript';
	import {
		IconCircleChevronRight,
		IconCoin,
		IconExclamationMark,
		IconMessage,
		IconMessageReport,
		IconQuestionMark,
		IconXboxB
	} from '@tabler/icons-svelte';

	export let command: StateCommand;
	export let stateInfo: Script['stateInfos'][number];
	export let script: Script;
	export let isChoice: boolean;
	export let isAnser: boolean;
</script>

<!-- Say a blocking message -->
{#if command.args[1] === 'select'}
	<div class="row">
		<IconQuestionMark />
		Ask question
	</div>
	<div class="row">
		<textarea placeholder="Ask question" bind:value={command.message} />
	</div>
{:else if isChoice}
	<div class="row">
		{#if command.args[0] === 'select:cancel'}
			<IconXboxB />
		{:else if command.args[1].startsWith('money:')}
			<IconCoin />
		{:else}
			<IconCircleChevronRight />
		{/if}
		<textarea placeholder="Say message" bind:value={command.message} />
	</div>
{:else if command.args[1] === 'anser'}
	<div class="row">
		<IconExclamationMark />
		Ask for evidence
	</div>
	<div class="row">
		<textarea placeholder="Ask for evidence" bind:value={command.message} />
	</div>
{:else if isAnser}
	<div class="row">
		<IconMessageReport />
		<textarea placeholder="Say message" bind:value={command.message} />
	</div>
{:else}
	<div class="row">
		<IconMessage />
		<textarea placeholder="Say message" bind:value={command.message} />
	</div>
{/if}
