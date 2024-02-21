<script lang="ts">
    import { fly } from "svelte/transition";
    import { IconPlus, IconUsersGroup } from "@tabler/icons-svelte";
    import "../tabs.css";
    import { cubicInOut } from "svelte/easing";
    import type Quest from "../../../_lib/Quest";
    import EnemySet from "./EnemySet.svelte";
    import { EmSet } from "../../../_lib/types/EnemySet";
    
    export let session: Quest;

    function addEmSet() {
        let lastIndex = session.enemySet.sets.length ?
            session.enemySet.sets[session.enemySet.sets.length - 1].number + 1 :
            0;
        session.enemySet.sets = [...session.enemySet.sets, new EmSet(
            `Set ${lastIndex}`,
            lastIndex,
            []
        )];
    }
</script>

<aside class="tabSidebar" transition:fly|global={{x: -200, duration: 200, easing: cubicInOut}}>
    <header>
        <IconUsersGroup />
        <div class="text">
            <h1>Enemy Sets ({session.enemySet.sets.length})</h1>
            <span>"Waves" of enemies that can be spawned using a Task.</span>
        </div>
    </header>
    {#each session.enemySet.sets as set}
        <EnemySet set={set} on:delete={() => session.enemySet.sets = session.enemySet.sets.filter(x => x != set)} />
    {/each}
    <button class="addBtn" on:click={addEmSet}>
        <IconPlus />
        Add Enemy Set
    </button>
</aside>