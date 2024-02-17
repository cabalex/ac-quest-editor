<script>
    import { createEventDispatcher } from "svelte";
    import { IconQuestionMark, IconX } from "@tabler/icons-svelte";
    import { session } from "../store";
    import { fly } from "svelte/transition";
  import { cubicInOut } from "svelte/easing";

    const dispatch = createEventDispatcher();

    const close = () => dispatch("close");

    function dontShowAgain() {
        localStorage.setItem("acqe-hideRepackModal", "true");
        close();
    }
</script>
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="modal" on:click={close}>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="modalContent" on:click={(e) => e.stopPropagation()} transition:fly={{duration: 200, y: -100, easing: cubicInOut}}>
        <header>
            <IconQuestionMark size={36} />
            <div class="text">
                <h1>What now?</h1>
            </div>
            <button class="transparentBtn" style="color: white" on:click={close}>
                <IconX size={24}  />
            </button>
        </header>
        <p>You'll want to create a LayeredFS mod with your modded quest.</p>
        <p>To do this, go to your mods folder and create a new folder. Name it whatever you want.</p>
        <p>Then, place your file in this directory:</p>
        <code>[MOD NAME]/romfs/quest/quest{$session?.id}.dat</code>
        <p>Congratulations! You just made an Astral Chain mod!</p>
        <button on:click={dontShowAgain}>Don't show me this again</button>
    </div>
</div>

<style>
    code {
        background-color: #111;
        color: #fff;
        padding: 0.5rem;
        border-radius: 0.5rem;
        display: block;
        font-size: 1.5em;
        margin: 1rem 0;
    }
</style>