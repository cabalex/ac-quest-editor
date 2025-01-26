<script context="module" lang="ts">
	export interface SearchResult {
		label: string;
		text: string;
		onClick: () => void;
	}
</script>

<script lang="ts">
	import { IconSearch, IconX } from '@tabler/icons-svelte';
	import { createEventDispatcher } from 'svelte';

	let inputElem: HTMLInputElement;

	const dispatch = createEventDispatcher();

	export let query = '';
	export let style = '';
	export let placeholder = 'Search...';
	export let autocomplete: SearchResult[] = [];

	function search(e: Event) {
		dispatch("search", (e.target as HTMLInputElement).value);
	}

	function handleClick(e: MouseEvent) {
		if (query.length > 0 && autocomplete.length === 0) {
			dispatch("search", query);
		}
	}
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="search" {style} on:click={() => inputElem.focus()}>
	<input on:click={handleClick} bind:this={inputElem} bind:value={query} type="text" {placeholder} on:change={search} />
	<button disabled={query.length === 0} on:click={() => (query = '')}>
		{#if query.length > 0}
			<IconX />
		{:else}
			<IconSearch />
		{/if}
	</button>
	{#if autocomplete}
		<div class="autocomplete" on:click={(e) => e.stopPropagation()}>
			{#each autocomplete.slice(0, 50) as { label, text, onClick }, i}
				<div class="result" on:click={onClick}>
					<div class="label">{label}</div>
					<div class="text">{text}</div>
				</div>
			{/each}
			{#if autocomplete.length > 50}
				<div style="padding: 10px">{autocomplete.length - 50} more results...</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.search {
		position: relative;
		display: flex;
		align-items: center;
		width: calc(100% - 20px);
		padding: 10px;
		background-color: #111;
		border: 1px solid #111;
	}
	input {
		flex-grow: 1;
		background-color: transparent;
		border: none;
		font-size: unset;
		color: var(--text);
	}
	input:focus-visible {
		outline: none;
	}
	.search:has(input:focus-visible) {
		border-color: #444;
	}
	button {
		border: none;
		padding: 4px;
		width: unset;
	}
	button:disabled {
		cursor: default;
		background-color: unset;
		opacity: unset;
	}
	.autocomplete {
		position: absolute;
		top: 100%;
		left: 0;
		width: 100%;
		max-height: 500px;
		overflow-y: auto;
		background-color: #111;
		border: 1px solid #444;
		border-top: none;
		border-radius: 0 0 5px 5px;
		box-shadow: 0 5px 10px rgba(0, 0, 0, 0.5);
		z-index: 10;
	}
	.autocomplete::-webkit-scrollbar {
		width: 10px;
	}
	.autocomplete::-webkit-scrollbar-thumb {
		background-color: #444;
		border-radius: 5px;
	}
	.autocomplete .result {
		padding: 10px;
		border-bottom: 1px solid #444;
		cursor: pointer;
		transition: background-color 0.1s ease-in-out;
	}
	.autocomplete .result:hover {
		background-color: #333;
	}
	.autocomplete .result .label {
		font-size: 0.75em;
		font-weight: bold;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
