<script lang="ts">
    import { currentTab, currentEm, currentTask, session } from "./store";
    import IconBar from "./IconBar/IconBar.svelte";
    import SideBar from "./SideBar/SideBar.svelte";
    import Map from "./Map/Map.svelte";
    import GettingStarted from "./GettingStarted/GettingStarted.svelte";
    import Tasks from "./Tasks/Tasks.svelte";
    import EmPopup from "./SideBar/tabs/EnemySets/EmPopup.svelte";


    $: {
        if ($session === null) {
            $currentTab = null;
            $currentEm = null;
            $currentTask = null;
        }
    }
</script>

<IconBar />
<main style="width: 100%; position: relative">
    <GettingStarted hidden={$session !== null} />
    {#if $session !== null}
        <SideBar />
        {#if $currentTab == "enemySets" && $currentEm !== null}
            {#key $currentEm.Ids[0]}
                <EmPopup em={$currentEm} on:close={() => $currentEm = null} />            
            {/key}
        {/if}
        {#if ($currentTab == "tasks" || $currentTab == "flags" || $currentTab == "talkScripts") && $currentTask !== null}
            <Tasks />
        {/if}
        <Map />
    {/if}
</main>