<script lang="ts">
    import { currentTab, currentEm, currentTask, currentTalkScript, session } from "./store";
    import IconBar from "./IconBar/IconBar.svelte";
    import SideBar from "./SideBar/SideBar.svelte";
    import Map from "./Map/Map.svelte";
    import GettingStarted from "./GettingStarted/GettingStarted.svelte";
    import Tasks from "./Tasks/Tasks.svelte";
    import EmPopup from "./SideBar/tabs/EnemySets/EmPopup.svelte";
    import TalkScriptEditor from "./TalkScriptEditor/TalkScriptEditor.svelte";


    $: {
        if ($session === null) {
            $currentTab = null;
            $currentEm = null;
            $currentTask = null;
            $currentTalkScript = null;
        }
    }

    // remember last selected tab
    let emTab = "about";
</script>

<IconBar />
<main style="width: 100%; position: relative">
    <GettingStarted hidden={$session !== null} />
    {#if $session !== null}
        {#key $session.id}
            <SideBar />
            {#if $currentTab == "enemySets" && $currentEm !== null}
                {#key $currentEm.Id}
                    <EmPopup bind:tab={emTab} em={$currentEm} on:close={() => $currentEm = null} />            
                {/key}
            {/if}
            {#if ($currentTab == "tasks" || $currentTab == "flags" || $currentTab == "talkScripts") && $currentTask !== null}
                <Tasks />
            {/if}
            {#if $currentTab == "talkScripts" && $currentTalkScript}
                <TalkScriptEditor script={$currentTalkScript} />
            {/if}
        {/key}
        <Map />
    {/if}
</main>