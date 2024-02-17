<script lang="ts">
    import { fly } from "svelte/transition";
    import { IconCode } from "@tabler/icons-svelte";
    import "../tabs.css";
    import { cubicInOut } from "svelte/easing";
    import type Quest from "../../../_lib/Quest";
    import Task from "./Task.svelte";
    
    export let session: Quest;
</script>

<aside class="tabSidebar" transition:fly|global={{x: -200, duration: 200, easing: cubicInOut}}>
    <header>
        <IconCode />
        <div class="text">
            <h1>Tasks ({session.questData.tasks.length})</h1>
            <span>Scripts that can run game logic in real time.</span>
        </div>
    </header>
    {#each session.questData.tasks as task, i}
        <Task task={task} i={i} on:delete={() => session.questData.tasks = session.questData.tasks.filter(x => x != task)} />
    {/each}
</aside>