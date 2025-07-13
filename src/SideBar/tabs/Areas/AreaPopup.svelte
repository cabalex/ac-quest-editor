<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fly } from 'svelte/transition';
	import { cubicIn } from 'svelte/easing';
	import { IconCopy, IconPlus, IconTrash, IconX } from '@tabler/icons-svelte';
	import NumberInput from '../../../assets/NumberInput.svelte';
	import BoolInput from '../../../assets/BoolInput.svelte';
	import { updateMap } from '../../../Map/Map.svelte';
	import { Area, AreaGroup } from '../../../_lib/types/QuestData';
	import TextInput from '../../../assets/TextInput.svelte';
	import AreaComponent from './Area.svelte';
	import { session } from '../../../store';

	const dispatch = createEventDispatcher();

	export let area: AreaGroup;

	let firstTimeUpdate = true;
	function mapChange() {
		if (firstTimeUpdate) {
			firstTimeUpdate = false;
			return;
		}
		updateMap();
	}

	function addArea() {
		// must reference session here so that Svelte knows to update the DOM.
		area.groups = [...area.groups, new Area(area.groups.length, 1)];
	}

	function deleteArea() {
		if (!$session || typeof $session === 'string') return;

		let index = $session.questData.areas.indexOf(area);
		if (index === -1) return;
		$session.questData.areas.splice(index, 1);

		dispatch('close');
	}

	function duplicateEm() {
		if (!$session || typeof $session === 'string') return;

		let newArea = new AreaGroup(
			`${area.name} (Copy)`,
			$session.questData.areas.length,
			area.debugDisplay,
			[]
		);
		newArea.groups = area.groups.map((group) => new Area(group.index, group.type));
		$session.questData.areas = [...$session.questData.areas, newArea];
		dispatch('close');
		updateMap();
	}
</script>

{#if area}
	<div class="areaPopup" transition:fly|global={{ x: -50, duration: 100, easing: cubicIn }}>
		<header>
			<div class="text">
				<h1 translate="yes" style="font-weight: bold">{area.name}</h1>
				<span style="color: #ccc">Index {area.index}</span>
			</div>
			<button class="transparentBtn" style="color: white" on:click={() => dispatch('close')}>
				<IconX />
			</button>
		</header>
		<div class="content">
			<div class="quickActions">
				<button on:click={duplicateEm}>
					<IconCopy />
					Duplicate
				</button>
				<button class="deleteBtn" on:click={deleteArea}>
					<IconTrash />
					Delete
				</button>
			</div>
			<TextInput label="Area Group Name" bind:value={area.name} />
			<NumberInput label="Area Group ID" bind:value={area.index} />
			<BoolInput
				label="Debug display"
				description="Used in development. Does nothing now."
				bind:value={area.debugDisplay}
			/>
			{#if area.groups !== undefined}
				{#each area.groups as group, j}
					<AreaComponent
						bind:area={group}
						i={j}
						on:delete={() => (area.groups = area.groups.filter((x) => x != group))}
					/>
				{/each}
			{/if}
			<button class="addBtn" on:click={addArea}>
				<IconPlus />
				Add Area
			</button>
		</div>
	</div>
{/if}

<style>
	.areaPopup {
		position: fixed;
		top: 32px;
		left: 707px;
		border-radius: 10px;
		z-index: 3;
		background: #444;
		box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
		min-width: min(500px, max(200px, calc(100vw - 707px)));
		max-width: 500px;
		max-height: calc(100% - 64px);
	}
	header {
		background-color: var(--primary-900);
		border-radius: 10px 10px 0 0;
		height: 64px;
		position: relative;
	}
	header .text {
		position: absolute;
		left: 10px;
		z-index: 1;
		filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.5));
	}
	header button {
		position: absolute;
		top: 10px;
		right: 10px;
		z-index: 1;
	}
	.quickActions {
		display: flex;
		gap: 10px;
		width: calc(100% - 20px);
		padding: 10px;
	}
	.quickActions button {
		flex-grow: 1;
		width: 100%;
	}
	.addBtn {
		margin: 5px;
		width: calc(100% - 10px);
	}
	.content {
		overflow-y: auto;
		max-height: calc(100vh - 200px);
	}
</style>
