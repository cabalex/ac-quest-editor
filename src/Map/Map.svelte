<script lang="ts">
    import Panzoom from '@panzoom/panzoom';
    import { onDestroy, onMount } from 'svelte';
    import { questAreaLookup } from '../_lib/lookupTable';
    import { currentTab, currentEm, session } from '../store';
    import { Em } from '../_lib/types/EnemySet';

    let mapElem: HTMLDivElement;

    $: map = questAreaLookup($session?.id || "0") || "r300";
    let panzoom: Panzoom;

    onMount(() => {
        panzoom = Panzoom(mapElem, {
            maxScale: 10,

        })
        mapElem.addEventListener('wheel', panzoom.zoomWithWheel)
        
        // Must use timeout to ensure these are set.
        setTimeout(() => {
            panzoom.pan(-1800, -1000);
            panzoom.zoom(2);
        }, 0);
    })

    onDestroy(() => {
        mapElem?.remove();
        panzoom?.destroy();
    })

    let lastOpen = false;
    function toggleOpen(tab: string|null) {
        if (!panzoom || (tab === null && !lastOpen) || (tab !== null && lastOpen)) return;
        let pan = panzoom.getPan();
        let zoom = panzoom.getScale();
        if ($currentTab === null) {
            panzoom?.pan(pan.x - 210 / zoom, pan.y, { animate: true });
            lastOpen = false;
        } else {
            panzoom?.pan(pan.x + 210 / zoom, pan.y, { animate: true });
            lastOpen = true;
        }
    }

    $: toggleOpen($currentTab);
    let cachedEm: Em|null = null;
</script>

<div class="mapContainer" class:full={$currentTab === null}>
    <div
        class="map"
        bind:this={mapElem}
        on:panzoomstart={() => {cachedEm = $currentEm; $currentEm = null}}
        on:panzoomend={() => { $currentEm = cachedEm; cachedEm = null}}
    >
        <img src={`./maps/${map.slice(1)}.svg`} alt="Map" />
        {#each ($session?.enemySet.sets || []) as set}
            {#each set.ems as em}
                <div
                    class="em"
                    class:active={$currentEm === em || cachedEm === em}
                    class:nearby={set.ems.includes($currentEm || cachedEm || false)}
                    role="button"
                    tabindex="0"
                    on:click={(e) => {$currentTab = "enemySets"; $currentEm = em; e.stopPropagation()}}
                    style={`top: ${2200 + em.Trans.x * 2}px; left: ${2200 - em.Trans.z * 2}px; background-color: hsl(${set.number * 10}, 50%, 60%)`}
                />
            {/each}
        {/each}
    </div>
</div>

<style>
    .mapContainer {
        position: absolute;
        right: 0;
        top: 0;
        height: 100%;
        width: 100%;
        z-index: 1;
    }
    .mapContainer.full {
        width: 100%;
    }
    .map {
        position: relative;
    }
    .map img {
        height: 4400px;
        width: 4400px;
    }
    .em {
        position: absolute;
        width: 4px;
        height: 4px;
        border-radius: 100%;
    }
    .em.nearby {
        outline: 1px solid var(--primary-400);
    }
    .em.active {
        outline: 1px solid red;
        z-index: 3;
    }
</style>