<script lang="ts">
	import { fly } from 'svelte/transition';
	import { currentTab, session, sessions } from '../store';
	import { cubicInOut } from 'svelte/easing';
	import {
		IconCode,
		IconFlag,
		IconInfoCircle,
		IconMap2,
		IconMessage,
		IconPlus,
		IconTrash,
		IconUsersGroup
	} from '@tabler/icons-svelte';
	import { lookup } from '../_lib/lookupTable';
	import About from './tabs/About.svelte';
	import EnemySets from './tabs/EnemySets/EnemySets.svelte';
	import Areas from './tabs/Areas/Areas.svelte';
	import Tasks from './tabs/Tasks/Tasks.svelte';
	import TalkScripts from './tabs/TalkScripts/TalkScripts.svelte';
	import Flags from './tabs/Flags.svelte';
	import ExportDropdown from './ExportDropdown.svelte';
	import './SideBar.css';
	import Quest from '../_lib/Quest';

	function deleteSession() {
		if (
			confirm(
				'Are you sure you want to delete this session? It will be lost forever! (Repack if you want to come back to this later.)'
			)
		) {
			let temp = $session;
			$session = null;
			setTimeout(() => ($sessions = $sessions.filter((s) => s !== temp)), 200);
		}
	}

	function setTab(tab: string) {
		if (typeof $session !== 'object') return;
		if ($currentTab == tab) {
			$currentTab = null;
			if ($session) $session.tab = null;
		} else {
			currentTab.set(tab);
			if ($session) $session.tab = tab;
		}
	}

	const ifSession = () => {
		if ($session instanceof Quest) {
			return $session;
		} else {
			return null;
		}
	};

	$: validSession = ifSession();
</script>

<aside transition:fly={{ x: -200, duration: 200, easing: cubicInOut }}>
	<header>
		<div class="text">
			<h1>
				Quest <b>{validSession?.id || '0000'}</b>
			</h1>
			<span>{lookup(`quest${validSession?.id || '0000'}`)}</span>
		</div>
	</header>
	<button class:active={$currentTab == 'about'} on:click={() => setTab('about')}>
		<IconInfoCircle />
		About
	</button>
	<hr />
	<h2 class="sectionHeader">On the map</h2>
	<button class:active={$currentTab == 'enemySets'} on:click={() => setTab('enemySets')}>
		<IconUsersGroup />
		Enemy Sets
	</button>
	<button class:active={$currentTab == 'zones'} on:click={() => setTab('zones')}>
		<IconMap2 />
		Areas
	</button>
	<h2 class="sectionHeader">Quest logic</h2>
	<button class:active={$currentTab == 'tasks'} on:click={() => setTab('tasks')}>
		<IconCode />
		Tasks
	</button>
	<button class:active={$currentTab == 'flags'} on:click={() => setTab('flags')}>
		<IconFlag />
		Flags
	</button>
	<h2 class="sectionHeader">Extensions</h2>
	<button class:active={$currentTab == 'talkScripts'} on:click={() => setTab('talkScripts')}>
		<IconMessage />
		TalkScripts
		{#if !validSession?.talkScript}
			<span class="addBadge">
				<IconPlus />
			</span>
		{/if}
	</button>
	<div style="flex-grow: 1; height: 100%" />
	<hr />
	<ExportDropdown />
	<button on:click={deleteSession} style="color: var(--danger)">
		<IconTrash />
		Delete
	</button>
</aside>
{#if validSession != null}
	{#if $currentTab == 'about'}
		<About session={validSession} />
	{:else if $currentTab == 'enemySets'}
		<EnemySets session={validSession} />
	{:else if $currentTab == 'zones'}
		<Areas session={validSession} />
	{:else if $currentTab == 'tasks'}
		<Tasks session={validSession} />
	{:else if $currentTab == 'flags'}
		<Flags session={validSession} />
	{:else if $currentTab == 'talkScripts'}
		<TalkScripts session={validSession} />
	{/if}
{/if}
