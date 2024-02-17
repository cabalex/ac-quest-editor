<script lang="ts">
    import { fly } from "svelte/transition";
    import { IconMap2 } from "@tabler/icons-svelte";
    import "./tabs.css";
    import { cubicInOut } from "svelte/easing";
    import type Quest from "../../_lib/Quest";
    
    export let session: Quest;
</script>

<aside class="tabSidebar" transition:fly|global={{x: -200, duration: 200, easing: cubicInOut}}>
    <header>
        <IconMap2 />
        <div class="text">
            <h1>Zones</h1>
            <span>Regions on the map that can detect players.</span>
        </div>
    </header>
</aside>