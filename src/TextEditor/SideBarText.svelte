<script lang="ts">
	import { fly } from 'svelte/transition';
	import '../SideBar/SideBar.css';
	import { cubicInOut } from 'svelte/easing';
	import { textCache } from '../store';
	import { IconCheck, IconDownload, IconLetterCase, IconUpload } from '@tabler/icons-svelte';
	import Search, { type SearchResult } from '../assets/Search.svelte';

	export let section: string | null;
	export let scrollTo = (section: string, key: string) => {};

	function exportText() {
		if (!$textCache) return;
		const output: { [key: string]: { [key: string]: [string, string] } } = {};
		for (let [key, value] of Object.entries($textCache.strings)) {
			output[key] = Object.fromEntries(value as Map<string, [string, string]>);
		}
		const data = JSON.stringify(output, null, 2);
		const blob = new Blob([data], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'TalkSubtitleMessage_USen.json';
		a.click();
		URL.revokeObjectURL(url);
	}

	let importSuccess = false;
	function importText() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json';
		input.onchange = async () => {
			const file = input.files?.[0];
			if (!file) return;
			const data = await file.text();
			const json = JSON.parse(data);
			for (let [key, value] of Object.entries(json)) {
				if (typeof value !== 'object' || value === null) {
					alert(
						'Invalid JSON format. Please ensure the top level only contains sections of dialogue.'
					);
					return;
				}
				for (let [k, v] of Object.entries(value)) {
					if (!Array.isArray(v) || v.length !== 2) {
						alert(
							'Invalid JSON format. Please ensure your sub level only contains values of [string, string].'
						);
						return;
					}
				}
				json[key] = new Map(Object.entries(value as { [key: string]: [string, string] }));
			}
			$textCache = { strings: json };
			importSuccess = true;
			setTimeout(() => (importSuccess = false), 1000);
		};
		input.click();
	}

	function navigate(newSection: string, newKey: string) {
		autocomplete = [];
		scrollTo(newSection, newKey);
	}

	function searchForString(query: string) {
		if (!$textCache) return [];
		const results: Array<SearchResult> = [];
		const strings = $textCache.strings;
		if (strings) {
			const lowerCaseQuery = query.toLowerCase();
			for (let [key, value] of Object.entries(strings)) {
				for (let [label, text] of value) {
					if (
						(label + " " + text.join(" ")).toLowerCase().includes(lowerCaseQuery)
					) {
						results.push({
							label: `${key} > ${label}`,
							text: `${text[0]}`,
							onClick: navigate.bind(null, key, label)
						});
					}
				}
			}
		}

		return results;
	}

	let query = '';
	$: autocomplete = query.length > 3 ? searchForString(query) : [];
</script>

<aside style="width: 300px" transition:fly={{ x: -200, duration: 200, easing: cubicInOut }}>
	<header>
		<div class="text">
			<h1>Game Text</h1>
			<span>Modify the game's global text tables.</span>
		</div>
	</header>
	<Search
		placeholder="Search all text in the game..."
		style="width: calc(100% - 2px)"
		bind:query
		on:search={(e) => (autocomplete = searchForString(e.detail))}
		{autocomplete}
	/>
	<div class="sections">
		{#if $textCache !== null}
			{#each Object.entries($textCache.strings) as [key, value], i}
				<button
					class="sidebarBtn"
					class:active={section === key}
					on:click={() => (section === key ? (section = null) : (section = key))}
				>
					{#if value.size === 0}
						<span style="width: 24px" />
					{:else}
						<IconLetterCase />
					{/if}
					<code>{key}</code> ({value.size})
				</button>
			{/each}
		{/if}
	</div>
	<hr />
	<button on:click={exportText}>
		<IconDownload />
		Export Text as JSON
	</button>
	<button on:click={importText} style="color: var(--danger)">
		{#if importSuccess}
			<IconCheck />
			Import successful!
		{:else}
			<IconUpload />
			Import JSON
		{/if}
	</button>
</aside>

<style>
	header {
		margin-bottom: 10px;
	}
	code {
		background-color: rgba(0, 0, 0, 0.5);
		font-size: 16px;
		padding: 5px;
		border-radius: 5px;
	}
	.sections {
		display: flex;
		flex-direction: column;
		width: 100%;
		gap: 5px;
		height: 100%;
		overflow-y: auto;
		padding: 10px;
	}
</style>
