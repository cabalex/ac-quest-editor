<script lang="ts">
    import { fly } from "svelte/transition";
    import { IconFlag, IconFlagCheck } from "@tabler/icons-svelte";
    import "./tabs.css";
    import { cubicInOut } from "svelte/easing";
    import type Quest from "../../_lib/Quest";
    
    export let session: Quest;
</script>

<aside class="tabSidebar" transition:fly|global={{x: -200, duration: 200, easing: cubicInOut}}>
    <header>
        <IconFlag />
        <div class="text">
            <h1>Flags</h1>
            <span>Quest-specific flags that are either temporary, or saved to your file.</span>
        </div>
    </header>

    <h2 class="sectionHeader">Quest flags</h2>
    {#each session.questData.questFlags.map((x, i) => [x, i]).filter((x) => x[0] !== `Flag${x[1].toString().padStart(2, "0")}`) as flag}
        <div class="flag">
            <span style="display: flex; align-items: center">
                <IconFlagCheck />
                <b style="font-size: 20px">{flag[1]}</b>
            </span>
            <span translate="yes">{flag[0]}</span>
        </div>
    {/each}
    <h2 class="sectionHeader">Save flags</h2>
    {#each session.questData.saveFlags.map((x, i) => [x, i]).filter((x) => x[0] !== `SaveFlag${x[1].toString().padStart(2, "0")}`) as flag}
        <div class="flag">
            <span style="display: flex; align-items: center">
                <IconFlagCheck />
                <b style="font-size: 20px">{flag[1]}</b>
            </span>
            <span translate="yes">{flag[0]}</span>
        </div>
    {/each}
    <h2 class="sectionHeader">Not seeing a flag?</h2>
    <span style="margin: 10px">64 Quest Flags and Save Flags always exist in the file; however, the ones used are usually renamed. If a flag is used without showing up here, it wasn't renamed to something other than the default "FlagXX".</span>
</aside>

<style>
    .flag {
        display: flex;
        align-items: center;
        padding: 10px;
        width: calc(100% - 20px);
        gap: 10px;
    }
</style>