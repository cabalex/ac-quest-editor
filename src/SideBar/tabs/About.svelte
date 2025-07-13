<script lang="ts">
	import { fly } from 'svelte/transition';
	import { IconInfoCircle } from '@tabler/icons-svelte';
	import './tabs.css';
	import { cubicInOut } from 'svelte/easing';
	import TextInput from '../../assets/TextInput.svelte';
	import BoolInput from '../../assets/BoolInput.svelte';
	import type Quest from '../../_lib/Quest';
	import VectorInput from '../../assets/VectorInput.svelte';
	import NumberInput from '../../assets/NumberInput.svelte';

	export let session: Quest;
</script>

<aside
	class="tabSidebar about"
	transition:fly|global={{ x: -200, duration: 200, easing: cubicInOut }}
>
	<header>
		<IconInfoCircle />
		<div class="text">
			<h1>About this Quest</h1>
			<span>Details about the quest.</span>
		</div>
	</header>
	<TextInput
		label="Quest ID"
		description="A 32-bit hex value that uniquely identifies this quest."
		bind:value={session.id}
	/>
	<NumberInput label="Version" description="Always 16." bind:value={session.questData.version} />
	<h2 class="sectionHeader">Quest Sub</h2>
	<NumberInput
		label="Minimum Level"
		description="Always 1. Could possibly be legacy information from development?"
		bind:value={session.questData.sub.MinLevel}
	/>
	<NumberInput
		label="Maximum Level"
		description="Always 1. Could possibly be legacy information from development?"
		bind:value={session.questData.sub.MaxLevel}
	/>
	<BoolInput
		label="Set Main Scenario"
		description="Set the main scenario flag upon starting this quest?"
		bind:value={session.questData.sub.bSetMainScenario}
	/>
	<span class="nested" class:disabled={!session.questData.sub.bSetMainScenario}>
		<TextInput
			label="Main Scenario Value"
			bind:value={session.questData.sub.SetMainScenarioValueStr}
		/>
	</span>
	<BoolInput
		label="Set Player Position on Start"
		description="Teleport the player upon starting this quest?"
		bind:value={session.questData.sub.bSetPlStartPos}
	/>
	<span class="nested" class:disabled={!session.questData.sub.bSetPlStartPos}>
		<VectorInput label="Starting Position" bind:value={session.questData.sub.PlStartPos} />
		<NumberInput label="Starting Rotation Y" bind:value={session.questData.sub.PlStartRotY} />
	</span>
</aside>

<style>
	:global(.tabSidebar.about input) {
		max-width: 75px;
	}
</style>
