<script lang="ts">
    import { fly } from "svelte/transition";
    import { IconMessage } from "@tabler/icons-svelte";
    import "./tabs.css";
    import { cubicInOut } from "svelte/easing";
    import type Quest from "../../_lib/Quest";
    
    export let session: Quest;
</script>

<aside class="tabSidebar" transition:fly|global={{x: -200, duration: 200, easing: cubicInOut}}>
    <header>
        <IconMessage />
        <div class="text">
            <h1>TalkScripts</h1>
            <span>Dialogue players can see and hear. Referenced by Tasks.</span>
        </div>
    </header>
</aside>