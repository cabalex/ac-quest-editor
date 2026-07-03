<script lang="ts">
	import type { StateCommand, Script } from '../../../../_lib/types/TalkScript';
	import { IconSquarePlus } from '@tabler/icons-svelte';

	export let command: StateCommand;
	export let stateInfo: Script['stateInfos'][number];
	export let script: Script;
	export let isChoice: boolean;
	export let isAnser: boolean;
</script>

<!-- Add/take money using the table system (or just a number) -->
<div class="row">
	<IconSquarePlus />
	Give money
	<input type="text" placeholder="Amount in G" bind:value={command.args[0]} />
	{command.args[0].startsWith('0x') ? '' : 'G'}
</div>
{#if command.args[1] === 'table'}
	<div class="row" style="font-size: 0.8em;">(taking from core/talkscript_item_table.bxm.)</div>
{/if}
