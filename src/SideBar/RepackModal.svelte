<script>
    import { createEventDispatcher } from "svelte";
    import { IconFileCheck, IconX } from "@tabler/icons-svelte";
    import { session } from "../store";
    import Modal from "../assets/Modal.svelte";

    const dispatch = createEventDispatcher();

    function dontShowAgain() {
        localStorage.setItem("acqe-hideRepackModal", "true");
        dispatch("close");
    }
</script>
<Modal on:close={() => dispatch("close")}>
    <header>
        <IconFileCheck size={36} />
        <div class="text">
            <h1>Repackage Success!</h1>
        </div>
        <button class="transparentBtn" style="color: white" on:click={() => dispatch("close")}>
            <IconX size={24}  />
        </button>
    </header>
    <p>Congratulations! You just made an Astral Chain LayeredFS mod!</p>
    <p>Extract this ZIP file to the mods folder of your choice and start playing.</p>
    <code>mod-{$session?.id}.zip</code>
    <button on:click={dontShowAgain}>Don't show me this again</button>
</Modal>

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