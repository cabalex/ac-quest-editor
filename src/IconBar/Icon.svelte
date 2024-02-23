<script lang="ts">
    import { fly, slide } from "svelte/transition";
    import { cubicIn } from "svelte/easing";
    import { lookup } from "../_lib/lookupTable";
    import type Quest from "../_lib/Quest";
    import { session, currentTab, currentEm, currentTask, currentTalkScript } from "../store";

    export let ses: Quest;

    let hovered: {session: Quest, y: number}|null = null;

    function onHover(e: any) {
        if (hovered) return;
        hovered = {session: ses, y: e.target.getBoundingClientRect().top + 20};
    }

    function onHoverOff(e: any) {
        hovered = null;
    }

    function switchTab(ses: Quest) {
        $currentTab = ses.tab;
        $currentEm = null;
        $currentTask = null;
        $currentTalkScript = null;
        $session = ses;
    }
</script>
<button
    transition:slide={{duration: 100}}
    class="session"
    class:active={$session == ses}
    on:click={() => switchTab(ses)}
    on:mouseover={onHover}
    on:focus={onHover}
    on:mouseout={onHoverOff}
    on:blur={onHoverOff}
>
    {ses.id}
</button>

{#if hovered}
    {#key hovered.y}
    <div class="iconTooltip" style={`top: ${hovered.y}px`} transition:fly|global={{x: -20, duration: 100, easing: cubicIn}}>
        {lookup(`q${hovered.session.id}`) || hovered.session.id}
    </div>
    {/key}
{/if}

<style>
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
        background-color: #111;
        padding: 5px;
        border-radius: 5px;
        font-weight: bold;
    }
    .iconTooltip:before {
        content: "";
        position: absolute;
        top: 50%;
        left: -10px;
        transform: translateY(-50%) rotate(90deg);
        border: 5px solid transparent;
        border-top-color: #111;
    }
</style>