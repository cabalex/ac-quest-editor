<script lang="ts">
    import Panzoom, { type PanzoomObject } from '@panzoom/panzoom';
    import { onDestroy, onMount } from 'svelte';
    import { questAreaLookup, questLookup } from '../_lib/lookupTable';
    import { currentTab, currentEm, session } from '../store';
    import { Em } from '../_lib/types/EnemySet';
    import MapEm from './MapEm.svelte';
  import Vector from '../_lib/Vector';

    let mapElem: HTMLDivElement;

    $: map = questAreaLookup($session?.id || "0") || "r0";
    let panzoom: PanzoomObject;

    let zeroVector = new Vector();
    onMount(() => {
        panzoom = Panzoom(mapElem, {
            maxScale: 10,
        })
        mapElem.addEventListener('wheel', panzoom.zoomWithWheel)
        
        // Must use timeout to ensure these are set.
        setTimeout(() => {
            panzoom.reset();
            panzoom.zoom(2);
            panzoom.pan(-1350, -1000);
        }, 0);
    })

    onDestroy(() => {
        mapElem?.remove();
        panzoom?.destroy();
    })

    let lastOpen = false;
    function toggleOpen(tab: string|null) {
        if (!panzoom || (tab === null && !lastOpen) || (tab !== null && lastOpen)) return;
        let zoom = panzoom.getScale();
        if ($currentTab === null) {
            panzoom?.pan(-210 / zoom, 0, { animate: true, relative: true });
            lastOpen = false;
        } else {
            panzoom?.pan(210 / zoom, 0, { animate: true, relative: true });
            lastOpen = true;
        }
    }

    let panToEmEnabled = true;
    function panToEm(em: Em) {
        if (!panToEmEnabled || !panzoom) return;
        // TODO: THIS IS A HACK. Figure out how panzoom's panning works.
        // I've tried so many options and none of them work... just hardcode the zoom and width, i guess??
        panzoom.zoom(2);
        panzoom.pan(
            (em.Trans.z * 2) - (window.innerWidth / 2 + 1100) / 2,
            (-em.Trans.x * 2) - (window.innerHeight / 2 + 1300) / 2,
            { animate: true, focal: {x: toMap(em.Trans.z), y: toMap(-em.Trans.x)} }
        );
    }

    $: if ($currentEm && !cachedEm) panToEm($currentEm);

    const toMap = (coord: number) => 2200 + coord * 2;

    $: toggleOpen($currentTab);
    let cachedEm: Em|null = null;

    let x = 0;
    let y = 0;
    function calculateMouseCoords(e) {
        let scale = panzoom.getScale();
        let pan = panzoom.getPan();
        //console.log(pan.x, pan.y)
        x = ((e.clientX - (window.innerWidth - 1300) / 2) / scale + pan.x);
        y = (e.clientY / scale - pan.y);
    }
</script>

<div class="mapContainer" class:full={$currentTab === null}>
    <div
        class="map"
        bind:this={mapElem}
        role="img"
        on:mousemove={calculateMouseCoords}
        on:panzoomstart={() => {cachedEm = $currentEm; $currentEm = null}}
        on:panzoomend={() => { panToEmEnabled = false; $currentEm = cachedEm; cachedEm = null; setTimeout(() => panToEmEnabled = true, 0)}}
    >
        <img src={`./maps/${map.slice(1)}.svg`} alt="Map" />
        {#each ($session?.enemySet.sets || []) as set}
            {#each set.ems as em}
                <MapEm em={em} set={set} cachedEm={cachedEm} on:click={() => { $currentTab = "enemySets"; $currentEm = em; panToEm(em) }} />
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
                        style="fill: hsl({areaGroup.index * 10}, 50%, 50%); opacity: 0.4"
                    />
                    {/if}
                    <text
                        x={toMap(-area.center.z)}
                        y={toMap(area.center.x)}
                        fill="hsl({areaGroup.index * 10}, 50%, 10%)"
                        font-size="10"
                        width="{area.type === 1 ? (area.points[0].z - area.points[1].z) * 2 : area.radius * 4}px"
                        text-anchor="middle"
                        alignment-baseline="middle"
                    >
                        {areaGroup.name}
                    </text>
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
        background-color: #111;
    }
    .map svg.areas {
        position: absolute;
        top: 0;
        left: 0;
    }
</style>