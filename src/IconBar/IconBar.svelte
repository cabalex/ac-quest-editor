<script lang="ts">
    import { IconPlus } from '@tabler/icons-svelte';
    import { currentEm, currentTab, currentTask, session, sessions } from '../store';
    import Icon from './Icon.svelte';
</script>

<div class="iconBar">
    {#each $sessions as ses, i}
        <Icon ses={ses} />
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
        z-index: 12;

        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        overflow-y: auto;
    }

    .iconBar::-webkit-scrollbar {
        width: 0px;
    }

    .session {
        width: 45px;
        height: 34px;
        font-weight: bold;
        flex-shrink: 0;
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
    .iconTooltip {
        pointer-events: none;
        position: fixed;
        left: 70px;
        transform: translateY(-20px);
        z-index: 15;
        background-color: #222;
        padding: 5px;
        border-radius: 5px;
    }
</style>