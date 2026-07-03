<script lang="ts">
	import type { StateCommand, Script } from '../../../../_lib/types/TalkScript';
	import { IconShoppingBag } from '@tabler/icons-svelte';

	export let command: StateCommand;
	export let stateInfo: Script['stateInfos'][number];
	export let script: Script;
	export let isChoice: boolean;
	export let isAnser: boolean;

	// To edit these, edit core/coreui/ShopItemList.bxm.
	const SHOP_MENUS = [
		'SLID_PL_01',
		'SLID_PL_02',
		'SLID_PL_03',
		'SLID_PL_04',
		'SLID_PL_05',
		'SLID_PL_06',
		'SLID_PL_07',
		'SLID_PL_08',
		'SLID_PL_09',
		'SLID_PL_10',
		'SLID_PL_11',
		'SLID_PL_12',
		'SLID_PL_13',
		'SLID_PL_14',
		'SLID_PL_15',
		'SLID_PL_16',
		'SLID_PL_17',
		'SLID_PL_18',
		'SLID_PL_19',
		'SLID_PL_20'
	];
</script>

<!-- Open shop menu -->
<div class="row">
	<IconShoppingBag />
	Open shop menu
	{#if SHOP_MENUS.includes(command.args[0])}
		<select bind:value={command.args[0]}>
			{#each SHOP_MENUS as menu}
				<option value={menu}>{menu}</option>
			{/each}
		</select>
	{:else}
		<input type="text" placeholder="Shop ID" bind:value={command.args[0]} />
	{/if}
</div>
