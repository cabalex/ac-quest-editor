<script lang="ts">
    import { IconPlus } from '@tabler/icons-svelte';
    import { currentTab, currentTask, session, sessions } from '../store';
    import { slide } from 'svelte/transition';
    import { lookup } from '../_lib/lookupTable';
    import type Quest from '../_lib/Quest';

    function switchTab(ses: Quest) {
        $currentTab = ses.tab;
        $currentTask = null;
        $session = ses;
    }
</script>

<div class="iconBar">
    {#each $sessions as ses, i}
        <button
            transition:slide={{duration: 100}}
            title={lookup(`q${ses.id}`) || ses.id}
            class="session"
            class:active={$session == ses}
            on:click={() => switchTab(ses)}
        >
            {i + 1}
        </button>
    {/each}
    <button
        class="session"
        class:active={$session == null}
        on:click={() => $session = null}
    >
        <IconPlus />
    </button>
</div>

<style>
    .iconBar {
        padding: 10px;
        height: calc(100% - 20px);
        border-right: 1px solid #444;
        background-color: #111;
        z-index: 10;

        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
    }

    .session {
        width: 34px;
        height: 34px;
        font-weight: bold;
        line-height: 0;
        padding: 5px;
        border-radius: 5px;
        background-color: transparent;
        transition: background-color 0.1s ease-in-out;
    }

    .session:hover {
        background-color: #444;
    }

    .session.active {
        background-color: #666;
        cursor: default;
    }
</style>