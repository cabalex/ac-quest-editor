<script context="module" lang="ts">
	import { writable } from 'svelte/store';

	export const writableMap = writable<number>(0);
	export const updateMap = () => {
		console.log('updating writable');
		writableMap.update((n) => n + 1);
	};
</script>

<script lang="ts">
	import { questAreaLookup } from '../_lib/lookupTable';
	import { currentTab, currentEm, session } from '../store';
	import Map3D from './Map3D.svelte';
	import Quest from '../_lib/Quest';

	let map = questAreaLookup($session instanceof Quest ? $session.id : '0') || 'r0';
	// Selected floor index, or -1 for all floors.
	let floor = -1;

	const MAPS: { [key: string]: { name: string; bottom: number; top: number }[] } = {
		r100: [
			{ name: 'Eastside Highway', bottom: -999, top: -5 },
			{ name: 'Industrial Bypass No 4', bottom: -5, top: 25 },
			{ name: 'Rayleigh Plaza Parking', bottom: 0, top: 20 },
			{ name: 'Grand Avenue 1F', bottom: 0, top: 20 },
			{ name: 'Grand Avenue 2F', bottom: 20, top: 35 },
			{ name: 'Grand Avenue 3F', bottom: 28, top: 100 },
			{ name: 'Rayleigh Plaza Roof', bottom: 100, top: 999 }
		],
		// r200: one floor
		r240: [
			{ name: 'Yellow Line Gate', bottom: -999, top: -22 },
			{ name: 'Yellow Line Platform', bottom: -22, top: -10 },
			{ name: 'Blue Line Platform', bottom: -999, top: -15 },
			{ name: 'Transfer Hallway', bottom: -15, top: 999 }
		],
		r300: [
			// all floors are at relatively the same heights, except for the final arena
			{ name: 'Wall Access 1F', bottom: -25, top: 999 },
			{ name: 'Wall Access 2F', bottom: -25, top: 999 }, // maybe make this part better
			{ name: 'Sector V', bottom: -25, top: 999 },
			{ name: 'Z09 Forgotten Rooftops', bottom: -25, top: 999 },
			{ name: 'Tower C 14F', bottom: -25, top: 999 },
			{ name: 'Tower C 1F', bottom: -999, top: -25 },
			{ name: 'Community Plaza', bottom: -999, top: -25 }
		],
		r310: [
			{ name: 'Altar Room', bottom: -999, top: -30 },
			{ name: 'Forgotten Ducts', bottom: -30, top: 40 },
			{ name: 'Monitor Room', bottom: 40, top: 999 }
		],
		r400: [
			{ name: '1F', bottom: -999, top: 0 },
			{ name: '2F', bottom: 0, top: 10 },
			{ name: '3F', bottom: 10, top: 20 },
			{ name: '4F', bottom: 20, top: 40 },
			{ name: 'Azure Plaza', bottom: 40, top: 999 }
		],
		// r500: one floor
		r600: [
			{ name: 'Redshift Labs', bottom: -999, top: -220 },
			{ name: 'Legionis Lab', bottom: -220, top: 0 },
			{ name: 'Rooftop', bottom: 0, top: 450 },
			{ name: 'Aether Gardens', bottom: 450, top: 999 }
		],
		r800: [
			{ name: 'Outside', bottom: -999, top: 50 },
			{ name: '2F', bottom: 50, top: 64 },
			{ name: '3F', bottom: 64, top: 999 }
		],
		// r840: one floor
		r900: [
			{ name: 'Garage', bottom: -999, top: -15 },
			{ name: 'B2F', bottom: -15, top: -5 },
			{ name: 'B3F', bottom: -5, top: 10 },
			{ name: 'Heliport', bottom: 10, top: 999 }
		]
		// r910: one floor
	};

	// Allow changing maps after load
	let oldId = '';
	$: {
		if ($session instanceof Quest && $session.id !== oldId) {
			oldId = $session.id;
			map = questAreaLookup($session.id) || 'r0';
			floor = -1;
		}
	}
</script>

<div class="mapContainer" class:full={$currentTab === null}>
	<select bind:value={map} on:change={() => (floor = -1)} class="mapSelector">
		<option value="r100">Zone 36 Central City</option>
		<option value="r200">Zone 33 Harmony Square</option>
		<option value="r240">Zone 33 Ark Transport</option>
		<option value="r300">Zone 09 Sector V</option>
		<option value="r310">Hermit Hideout</option>
		<option value="r400">Zone 32 Ark Mall</option>
		<option value="r500">Ark Sewers</option>
		<option value="r600">Aegis Research Institute</option>
		<option value="r800">Zone 09 Hal's Hideout</option>
		<option value="r840">Zone 30 Maison Forest</option>
		<option value="r900">Zone 10 Police HQ</option>
		<option value="r910">Highway Junction</option>
		<option value="r0">Mystery Zone</option>
		<option value="rb00">Astral Plane (no map available)</option>
		<option value="r940">Max's Safehouse</option>
	</select>
	{#if MAPS[map] && MAPS[map].length > 1}
		<select class="floorSelector" bind:value={floor}>
			<option value={-1}>All floors</option>
			{#each MAPS[map] as floorData, i}
				<option value={i}>{floorData.name}</option>
			{/each}
		</select>
	{/if}
	<Map3D
		{map}
		{floor}
		floors={MAPS[map]}
		on:select={(e) => {
			$currentTab = 'enemySets';
			$currentEm = e.detail;
		}}
	/>
</div>

<style>
	.mapContainer {
		position: absolute;
		right: 0;
		top: 0;
		height: 100%;
		width: 100%;
		z-index: 1;
	}
	.mapSelector,
	.floorSelector {
		position: absolute;
		right: 5px;
		top: 5px;
		z-index: 10;
		font-size: unset;
		padding: 5px;
	}
	.floorSelector {
		top: 40px;
	}
</style>
