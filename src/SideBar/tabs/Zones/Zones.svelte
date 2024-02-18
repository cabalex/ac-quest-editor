<script lang="ts">
    import { fly } from "svelte/transition";
    import { IconCode, IconHelpCircleFilled, IconMap2, IconX } from "@tabler/icons-svelte";
    import "../tabs.css";
    import { cubicInOut } from "svelte/easing";
    import type Quest from "../../../_lib/Quest";
    import Modal from "../../../assets/Modal.svelte";
    import Zone from "./Zone.svelte";
    import BoolInput from "../../../assets/BoolInput.svelte";
  import NumberInput from "../../../assets/NumberInput.svelte";
    
    export let session: Quest;
</script>

<aside class="tabSidebar" transition:fly|global={{x: -200, duration: 200, easing: cubicInOut}}>
    <header>
        <IconMap2 />
        <div class="text">
            <h1>Zones ({session.questData.areas.length})</h1>
            <span>Regions on the map that can detect players.</span>
        </div>
    </header>
    {#each session.questData.areas as area, i}
        <hr />
        <h2 class="sectionHeader" translate="yes">{area.name}</h2>
        <NumberInput
            label="Area ID"
            bind:value={area.index}
        />
        <BoolInput
            label="Debug display"
            description="Does nothing."
            bind:value={area.debugDisplay}
        />
        {#each area.groups as group, j}
            <Zone zone={group} i={j} on:delete={() => area.groups = area.groups.filter(x => x != group)} />
        {/each}
    {/each}
</aside>