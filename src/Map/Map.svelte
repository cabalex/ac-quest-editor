<script lang="ts">
    import Panzoom, { type PanzoomObject } from '@panzoom/panzoom';
    import { onDestroy, onMount } from 'svelte';
    import { questAreaLookup, questLookup } from '../_lib/lookupTable';
    import { currentTab, currentEm, session } from '../store';
    import { Em } from '../_lib/types/EnemySet';

    let mapElem: HTMLDivElement;

    $: map = questAreaLookup($session?.id || "0") || "r300";
    let panzoom: PanzoomObject;

    onMount(() => {
        panzoom = Panzoom(mapElem, {
            maxScale: 10,

        })
        mapElem.addEventListener('wheel', panzoom.zoomWithWheel)
        
        // Must use timeout to ensure these are set.
        setTimeout(() => {
            panzoom.pan(-1100, -875);
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

    let panToEmEnabled = true;
    function panToEm(em: Em) {
        if (!panToEmEnabled) return;
        let zoom = panzoom.getScale();
        panzoom.pan(
            -1100 - (-em.Trans.z * 2) + (window.innerWidth - 1300) / zoom / 2,
            -1100 - (em.Trans.x * 2) + window.innerHeight / zoom / 2,
            { animate: true }
        );
    }

    function clickEm(em: Em) {
        panToEmEnabled = false;
        $currentEm = em;
        $currentTab = "enemySets";
        setTimeout(() => panToEmEnabled = true, 0);
    }

    $: if ($currentEm && !cachedEm) panToEm($currentEm);

    const toMap = (coord: number) => 2200 + coord * 2;

    $: toggleOpen($currentTab);
    let cachedEm: Em|null = null;
</script>

<div class="mapContainer" class:full={$currentTab === null}>
    <div
        class="map"
        bind:this={mapElem}
        on:panzoomstart={() => {cachedEm = $currentEm; $currentEm = null}}
        on:panzoomend={() => { panToEmEnabled = false; $currentEm = cachedEm; cachedEm = null; setTimeout(() => panToEmEnabled = true, 0)}}
    >
        <img src={`./maps/${map.slice(1)}.svg`} alt="Map" />
        {#each ($session?.enemySet.sets || []) as set}
            {#each set.ems as em}
                <div
                    class="em"
                    class:active={$currentEm === em || cachedEm === em}
                    class:nearby={($currentEm && cachedEm) && set.ems.includes($currentEm || cachedEm)}
                    role="button"
                    tabindex="0"
                    on:click={(e) => {clickEm(em); e.stopPropagation()}}
                    style={`top: ${toMap(em.Trans.x) - 2}px; left: ${toMap(-em.Trans.z) - 2}px; transform: rotate(${em.Rotation + Math.PI / 2}rad); background-color: hsl(${set.number * 10}, 50%, 60%)`}
                >
                {#if (questLookup(em.Id.toString(16), true) || "").startsWith("bga00") ||
                    (questLookup(em.Id.toString(16), true) || "").startsWith("bga03")}
                    <div class="wall" style={`width: ${em.SetType * 2}px`} />
                {/if}
                </div>
                {#if em.secondaryObjectEnabled}
                <div
                    class="em secondary"
                    class:active={$currentEm === em || cachedEm === em}
                    class:nearby={($currentEm && cachedEm) && set.ems.includes($currentEm || cachedEm)}
                    role="button"
                    tabindex="0"
                    on:click={(e) => {clickEm(em); e.stopPropagation()}}
                    style={`top: ${toMap(em.TransL.x) - 2}px; left: ${toMap(-em.TransL.z) - 2}px; transform: rotate(${em.Rotation + Math.PI / 2}rad); background-color: hsl(${set.number * 10}, 50%, 60%)`}
                />
                {/if}
            {/each}
        {/each}
        <svg class="areas" height="4400" width="4400" xmlns="http://www.w3.org/2000/svg">
            {#each ($session?.questData.areas || []) as areaGroup}
                {#each areaGroup.groups as area}
                    {#if area.type === 1}
                    <polygon
                        points={area.points.map(coord => `${toMap(-coord.z)},${toMap(coord.x)}`).join(" ")}
                        style={`fill: hsl(${areaGroup.index * 10}, 50%, 50%); opacity: 0.4`}
                    />
                    {:else}
                    <circle
                        cx={toMap(-area.center.z)}
                        cy={toMap(area.center.x)}
                        r={area.radius * 2}
                        style={`fill: hsl(${areaGroup.index * 10}, 50%, 50%); opacity: 0.4`}
                    />
                    {/if}
                {/each}
            {/each}
        </svg>
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
    .map svg.areas {
        position: absolute;
        top: 0;
        left: 0;
    }
    .em {
        position: absolute;
        width: 4px;
        height: 4px;
        border-radius: 100%;
        z-index: 1;
    }
    .em.nearby {
        outline: 1px solid var(--primary-400);
    }
    .em.active {
        outline: 1px solid red;
        z-index: 3;
    }
    .em.secondary:before {
        content: "L";
        font-size: 6px;
        position: absolute;
        top: -2px;
        left: 0.5px;
        font-weight: bold;
        color: #333;
    }
    .wall {
        background-color: red;
        height: 2px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translateX(-50%) translateY(-50%);
        z-index: -1;
    }
</style>