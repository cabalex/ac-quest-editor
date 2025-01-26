<script lang="ts">
	import VirtualList from '../assets/VirtualList.svelte';
	import { cubicInOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';
	import { textCache } from '../store';
	import { onDestroy, onMount } from 'svelte';
	import AstralChainText from '../assets/AstralChainText.svelte';
	import { IconAlertTriangle, IconPlus, IconTrash } from '@tabler/icons-svelte';

	export let section: string;
	export let scrollToIndex: ((key: string) => void) | undefined;
	let scrollToIndex_internal: ((index: number, opts: ScrollToOptions) => Promise<void>) | undefined;

	function loadSection() {
		if ($textCache && section && $textCache.strings[section]) {
			const sectionToLoad = [];
			for (const [key, value] of $textCache.strings[section]) {
				sectionToLoad.push({ key, value1: value[0], value2: value[1] });
			}
			return sectionToLoad.sort((a, b) => a.key.localeCompare(b.key));
		}
		return [];
	}
	let loadedSection: Array<{ key: string; value1: string; value2: string }> = loadSection();

	let focusedIndex: number | null = null;
	function scrollToIndex_caller(key: string) {
		if (scrollToIndex_internal) {
			const i = loadedSection.findIndex((text) => text.key === key);
			scrollToIndex_internal(i, { behavior: 'smooth' });
			focusedIndex = i;
			setTimeout(() => (focusedIndex = null), 2000);
		}
	}

	function deleteIndex(i: number) {
		const empty =
			loadedSection[i].key === '' &&
			loadedSection[i].value1 === '' &&
			loadedSection[i].value2 === '';
		if (empty || confirm("Are you sure you want to delete this line? It can't be undone.")) {
			loadedSection = loadedSection.filter((_, index) => index !== i);
		}
	}

	function saveSection() {
		if ($textCache) {
			const strings = new Map<string, [string, string]>();
			for (const text of loadedSection) {
				strings.set(text.key, [text.value1, text.value2]);
			}
			$textCache.strings[section] = strings;
		}
	}

	// Save it any time anything is updated
	$: if (loadedSection) saveSection();

	onMount(() => {
		scrollToIndex = scrollToIndex_caller;
	});
	onDestroy(saveSection);
</script>

<main transition:fly|global={{ x: 200, duration: 200, easing: cubicInOut }}>
	<header>
		<h1>{section}</h1>
		<p style="display: flex; align-items: center; gap: 10px;">
			<IconAlertTriangle />
			<span>Quest TalkScripts will <b>overwrite</b> their lines here on export. If you're working on a quest, edit it there!</span>
		</p>
	</header>
	<VirtualList
		bind:scrollToIndex={scrollToIndex_internal}
		items={loadedSection}
		height={'calc(100% - 100px)'}
		let:i
	>
		<div class="text" class:active={i === focusedIndex}>
			<button class="deleteBtn" on:click={() => deleteIndex(i)}><IconTrash /></button>
			<input class="textId" type="text" bind:value={loadedSection[i].key} />
			<AstralChainText
				style="height: 80px; flex-grow: 1; flex-basis: calc(calc(100% - 23.5ch) / 2);"
				bind:value={loadedSection[i].value1}
			/>
			<textarea bind:value={loadedSection[i].value2} />
		</div>
	</VirtualList>
	<button
		class="floatingBtn addBtn"
		on:click={() => {
			loadedSection = [...loadedSection, { key: '', value1: '', value2: '' }];
			setTimeout(
				() =>
					scrollToIndex_internal &&
					scrollToIndex_internal(loadedSection.length - 1, { behavior: 'smooth' }),
				0
			);
		}}
	>
		<IconPlus />
		Add Line
	</button>
</main>

<style>
	main {
		position: absolute;
		top: 0;
		right: 0;
		width: calc(100% - 320px);
		height: 100%;
		margin-top: 0;
		background-color: #242424;
	}
	main header {
		height: 79px;
		background-color: #333;
		border-bottom: 1px solid #444;
		display: flex;
		flex-direction: column;
		gap: 5px;
		align-items: flex-start;
	}
	main header > * {
		margin: 0;
	}
	.text {
		display: flex;
		align-items: center;
		gap: 10px;
		height: 100px;
		padding-left: 5px;
		border-bottom: 1px solid #444;
	}
	.text.active {
		animation: flash 0.5s linear infinite;
	}
	.deleteBtn {
		width: 48px;
        margin-left: 5px;
	}
	.floatingBtn {
		position: absolute;
		bottom: 10px;
		right: 20px;
		width: unset;
		border-radius: 100px;
		padding: 20px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
	}
	@keyframes flash {
		0%,
		100% {
			background-color: #242424;
		}
		50% {
			background-color: #777;
		}
	}
	.textId {
		font-family: monospace;
		font-size: 16px;
		width: 23.5ch;
		flex-shrink: 0;
	}
	textarea {
		flex-basis: calc(calc(100% - 23.5ch) / 2);
		flex-shrink: 0;
		flex-grow: 1;
		height: 80px;
		width: 100%;
		font-size: unset;
		font-family: unset;
	}
</style>
