<script lang="ts">
	import type { StateCommand, Script } from '../../../../_lib/types/TalkScript';
	import { IconSquareMinus } from '@tabler/icons-svelte';

	export let command: StateCommand;
	export let stateInfo: Script['stateInfos'][number];
	export let script: Script;
	export let isChoice: boolean;
	export let isAnser: boolean;
</script>

<!-- Add/remove item from player's inventory. -->
<div class="row">
	<IconSquareMinus />
	Remove item
	<input type="text" placeholder="Item ID" bind:value={command.args[0]} />
</div>
{#if command.args[1] === 'table'}
	<div class="row" style="font-size: 0.8em;">(taking from core/talkscript_item_table.bxm.)</div>
{/if}
