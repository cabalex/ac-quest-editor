<script lang="ts">
	import { fly, slide } from 'svelte/transition';
	import { IconMap2, IconMapPins, IconPlus } from '@tabler/icons-svelte';
	import '../tabs.css';
	import { cubicInOut } from 'svelte/easing';
	import type Quest from '../../../_lib/Quest';
	import AreaComponent from './Area.svelte';
	import BoolInput from '../../../assets/BoolInput.svelte';
	import NumberInput from '../../../assets/NumberInput.svelte';
	import TextInput from '../../../assets/TextInput.svelte';
	import { AreaGroup, Area } from '../../../_lib/types/QuestData';
	import { showAreasOnMap, currentArea } from '../../../store';

	export let session: Quest;

	function addAreaGroup() {
		session.questData.areas = [
			...session.questData.areas,
			new AreaGroup(
				`Area Group ${session.questData.areas.length}`,
				session.questData.areas.length,
				false,
				[]
			)
		];
	}

	function focusAreaGroup(area: AreaGroup) {
		if ($currentArea === area) {
			$currentArea = null;
			return;
		}
		$currentArea = area;
	}
</script>

<aside class="tabSidebar" transition:fly|global={{ x: -200, duration: 200, easing: cubicInOut }}>
	<header>
		<IconMap2 />
		<div class="text">
			<h1>Areas ({session.questData.areas.length})</h1>
			<span>Regions on the map that can detect players.</span>
		</div>
	</header>
	<BoolInput label="Show areas on the map" bind:value={$showAreasOnMap} />
	{#each session.questData.areas as area, i}
		<button
			class="area"
			class:active={$currentArea === area}
			on:click={focusAreaGroup.bind(null, area)}
			transition:slide={{ duration: 100, easing: cubicInOut }}
		>
			<IconMapPins />
			<h3 class="iconNumber">{area.index}</h3>
			<h3 translate="yes">{area.name}</h3>
		</button>
	{/each}
	<button class="addBtn" on:click={addAreaGroup}>
		<IconPlus />
		Add Area Group
	</button>
</aside>

<style>
	.area {
		display: flex;
		align-items: center;
		background-color: #444;
		width: calc(100% - 10px);
		padding: 10px;
		gap: 10px;
		margin-bottom: 5px;
		min-height: 54px;
		text-align: left;
	}
	.area h3 {
		margin: 0;
	}
	.area.active {
		background-color: #666;
	}
	.addBtn {
		width: calc(100% - 10px);
		margin: 0;
	}
</style>
