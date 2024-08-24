<script lang="ts">
    import { IconArrowsShuffle, IconFileCheck, IconX } from "@tabler/icons-svelte";
    import BoolInput from "../assets/BoolInput.svelte";
    import Modal from "../assets/Modal.svelte";
    import SelectStringInput from "../assets/SelectStringInput.svelte";
    import TextInput from "../assets/TextInput.svelte";
    import { tick } from "svelte";
    import randomize from "./randomizer";
  import { writable } from "svelte/store";

    let randomizeEm = true;
    let randomizePl = false;
    let randomizeBg = false;
    let randomizeBa = false;

    let randomizationMode: 'fixed-pool'|'true-random' = 'fixed-pool';
    let trueRandomization = false;
    let lappyMode = false;
    let seed = '';

    let progressWritable = writable('Randomizing...');

    $: {
        if (lappyMode && randomizePl) {
            randomizePl = false;
        }
    }

    let loading = false;
    let done = false;
    let time = 0;
    async function startRandomize() {
        loading = true;
        $progressWritable = 'Randomizing...';
        await new Promise((r) => setTimeout(r, 300));
        let start = performance.now();
        await randomize(
            randomizeEm,
            randomizePl,
            randomizeBg,
            randomizeBa,
            randomizationMode,
            trueRandomization,
            lappyMode,
            progressWritable,
            seed
        );
        loading = false;
        done = true;
        let end = performance.now();
        time = end - start;
        console.log(`Randomize took ${(end - start) / 1000 / 60} minutes (${end - start}ms)`);
    }
</script>

<main>
    <div class="randomizer">
        <h1>Astral Chain Randomizer</h1>
        <p><b>Many of these settings will produce unbeatable mods (⚠️)!</b> You have been warned :^)</p>
        <TextInput
            label="Seed"
            description="Leave empty for a random seed"
            bind:value={seed}
        />
        <h2 class="sectionHeader">Randomizer</h2>
        <BoolInput
            label="Randomize enemies"
            description="Chimeras, Homunculi"
            bind:value={randomizeEm}
        />
        <span style={lappyMode ? 'opacity: 0.5' : ''}>
            <BoolInput
                label="Randomize allies"
                description="Lappy, Hal, Olive"
                bind:value={randomizePl}
            />
        </span>
        
        <BoolInput
            label="Randomize interactable elements ⚠️"
            description="Ladders, switches, buttons"
            bind:value={randomizeBa}
        />
        <BoolInput
            label="Randomize static elements ⚠️"
            description="The Astral Plane, no-entry walls"
            bind:value={randomizeBg}
        />
        <SelectStringInput
            bind:value={randomizationMode}
            label="Randomization mode"
        >
            <option value="fixed-pool">Fixed pool (vanilla entities are shuffled)</option>
            <option value="true-random">True random (no entity type limits)</option>
        </SelectStringInput>
        <h2 class="sectionHeader">Danger zone</h2>
        <BoolInput
            label="Remove entity type limits ⚠️"
            description="Let Brenda be a chimera. Jena's a ladder. Who cares anymore"
            bind:value={trueRandomization}
        />
        <BoolInput
            label="Lappy mode"
            bind:value={lappyMode}
        />
        <button class="addBtn" on:click={startRandomize}>Randomize!</button>
    </div>
</main>
{#if loading}
<Modal>
    <header>
        <IconArrowsShuffle size={36} />
        <div class="text">
            <h1>{$progressWritable}</h1>
        </div>
    </header>
    <p>Sit back and relax. This may take up to 5 minutes (and maybe 1 GB of RAM).</p>
    <p><b>Do not close this tab.</b> You'll get a ZIP file when it's done.</p>
</Modal>
{/if}
{#if done}
<Modal on:close={() => done = false}>
    <header>
        <IconFileCheck size={36} />
        <div class="text">
            <h1>Randomize Success!</h1>
        </div>
        <button class="transparentBtn" style="color: white" on:click={() => done = false}>
            <IconX size={24}  />
        </button>
    </header>
    <p>Your randomized mod is ready!</p>
    <p>Extract the ZIP file to the mods folder of your choice and start playing.</p>
    <p>Randomize took {Math.floor(time / 1000 / 60)}m {Math.floor(time / 1000 % 60)}s.</p>
</Modal>
{/if}

<style>
    main {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>