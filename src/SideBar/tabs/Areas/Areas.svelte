<script lang="ts">
    import { fly } from "svelte/transition";
    import { IconMap2, IconPlus } from "@tabler/icons-svelte";
    import "../tabs.css";
    import { cubicInOut } from "svelte/easing";
    import type Quest from "../../../_lib/Quest";
    import AreaComponent from "./Area.svelte";
    import BoolInput from "../../../assets/BoolInput.svelte";
    import NumberInput from "../../../assets/NumberInput.svelte";
    import TextInput from "../../../assets/TextInput.svelte";
    import { AreaGroup, Area } from "../../../_lib/types/QuestData";
    
    export let session: Quest;

    function addAreaGroup() {
        session.questData.areas = [...session.questData.areas, new AreaGroup(
            `Area Group ${session.questData.areas.length}`,
            session.questData.areas.length,
            false,
            []
        )];
    }

    function addArea(index: number) {
        // must reference session here so that Svelte knows to update the DOM.
        session.questData.areas[index].groups = [...session.questData.areas[index].groups, new Area(session.questData.areas[index].groups.length, 1)];
    }
</script>

<aside class="tabSidebar" transition:fly|global={{x: -200, duration: 200, easing: cubicInOut}}>
    <header>
        <IconMap2 />
        <div class="text">
            <h1>Areas ({session.questData.areas.length})</h1>
            <span>Regions on the map that can detect players.</span>
        </div>
    </header>
    {#each session.questData.areas as area, i}
        <hr />
        <h2 class="sectionHeader" translate="yes">{area.name}</h2>
        <TextInput
            label="Area Group Name"
            bind:value={area.name}
        />
        <NumberInput
            label="Area Group ID"
            bind:value={area.index}
        />
        <BoolInput
            label="Debug display"
            description="Does nothing."
            bind:value={area.debugDisplay}
        />
        {#each area.groups as group, j}
            <AreaComponent area={group} i={j} on:delete={() => area.groups = area.groups.filter(x => x != group)} />
        {/each}
        <button style="width: calc(100% - 10px); margin-top: 5px; padding: 10px;" on:click={addArea.bind(null, i)}>
            <IconPlus />
            Add Area
        </button>
    {/each}
    <button class="addBtn" on:click={addAreaGroup}>
        <IconPlus />
        Add Area Group
    </button>
</aside>