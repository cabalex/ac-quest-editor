<script lang="ts">
    import Panzoom, { type PanzoomObject } from '@panzoom/panzoom';
    import { onDestroy, onMount } from 'svelte';
    import { questAreaLookup } from '../_lib/lookupTable';
    import { currentTab, currentEm, session, showAreasOnMap } from '../store';
    import { Em } from '../_lib/types/EnemySet';
    import MapEm from './MapEm.svelte';
    import Vector from '../_lib/Vector';

    let mapElem: HTMLDivElement;

    let map = questAreaLookup($session?.id || "0") || "r0";
    let floor = 0;
    let panzoom: PanzoomObject;

    const MAPS: { [key: string]: { name: string; bottom: number; top: number; }[] } = {
        "r100": [
            { name: "Eastside Highway", bottom: -999, top: -5 },
            { name: "Industrial Bypass No 4", bottom: -5, top: 25 },
            { name: "Rayleigh Plaza Parking", bottom: 0, top: 20 },
            { name: "Grand Avenue 1F", bottom: 0, top: 20 },
            { name: "Grand Avenue 2F", bottom: 20, top: 35 },
            { name: "Grand Avenue 3F", bottom: 28, top: 100 },
            { name: "Rayleigh Plaza Roof", bottom: 100, top: 999 },
        ],
        // r200: one floor
        "r240": [
            { name: "Yellow Line Gate", bottom: -999, top: -22 },
            { name: "Yellow Line Platform", bottom: -22, top: -10 },
            { name: "Blue Line Platform", bottom: -999, top: -15 },
            { name: "Transfer Hallway", bottom: -15, top: 999 },
        ],
        "r300": [
            // all floors are at relatively the same heights, except for the final arena
            { name: "Wall Access 1F", bottom: -25, top: 999 },
            { name: "Wall Access 2F", bottom: -25, top: 999 }, // maybe make this part better
            { name: "Sector V", bottom: -25, top: 999 },
            { name: "Z09 Forgotten Rooftops", bottom: -25, top: 999 },
            { name: "Tower C 14F", bottom: -25, top: 999 },
            { name: "Tower C 1F", bottom: -999, top: -25 },
            { name: "Community Plaza", bottom: -999, top: -25 },
        ],
        "r310": [
            { name: "Altar Room", bottom: -999, top: -30 },
            { name: "Forgotten Ducts", bottom: -30, top: 40 },
            { name: "Monitor Room", bottom: 40, top: 999 },
        ],
        "r400": [
            { name: "1F", bottom: -999, top: 0 },
            { name: "2F", bottom: 0, top: 10 },
            { name: "3F", bottom: 10, top: 20 },
            { name: "4F", bottom: 20, top: 40 },
            { name: "Azure Plaza", bottom: 40, top: 999 },
        ],
        // r500: one floor
        "r600": [
            { name: "Redshift Labs", bottom: -999, top: -220 },
            { name: "Legionis Lab", bottom: -220, top: 0 },
            { name: "Rooftop", bottom: 0, top: 450 },
            { name: "Aether Gardens", bottom: 450, top: 999 },
        ],
        "r800": [
            { name: "Outside", bottom: -999, top: 50 },
            { name: "2F", bottom: 50, top: 64 },
            { name: "3F", bottom: 64, top: 999 }
        ],
        // r840: one floor
        "r900": [
            { name: "Garage", bottom: -999, top: -15 },
            { name: "B2F", bottom: -15, top: -5 },
            { name: "B3F", bottom: -5, top: 10 },
            { name: "Heliport", bottom: 10, top: 999 },
        ]
        // r910: one floor
    }

    // Allow changing maps after load
    let oldId = '';
    $: {
        if (($session?.id || "0") !== oldId) {
            oldId = $session?.id || "0";
            map = questAreaLookup($session?.id || "0") || "r0";
            floor = lowestActiveFloor();
        }
    }

    function lowestActiveFloor() {
        if (Object.keys(MAPS).includes(map)) {
            const minimumHeight = Math.min(
                ...($session?.enemySet.sets.map(set => set.ems.map(em => em.Trans.y)).flat() ?? [-999])
            )
            for (let i = 0; i < MAPS[map].length; i++) {
                if (MAPS[map][i].bottom <= minimumHeight && MAPS[map][i].top >= minimumHeight) {
                    return i;
                }
            }
        }
        return 0;
    }

    onMount(() => {
        panzoom = Panzoom(mapElem, {
            maxScale: 10
        })
        mapElem.addEventListener('wheel', panzoom.zoomWithWheel)
        
        // Must use timeout to ensure these are set.
        setTimeout(() => {
            panzoom.reset();
            panzoom.zoom(2);
            panzoom.pan(-250, -750);
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
        if (Object.keys(MAPS).includes(map)) {
            let floorToChange = MAPS[map].findIndex(x => x.bottom <= em.Trans.y && x.top >= em.Trans.y);
            if (floorToChange !== -1) floor = floorToChange;
        }
        console.log(toMap(em.Trans.z) / 4400, toMap(-em.Trans.x) / 4400)
        panzoom.zoom(1);
        centerOn(toMap(-em.Trans.z) / 4400, toMap(em.Trans.x) / 4400)
        //panzoom.zoomIn()
    }

    // The percent values for x and y are expected in the range of 0 - 1. ie 50% = 0.5
    function centerOn(xPercent: number, yPercent: number) {
        if (!mapElem || ! mapElem.parentElement) return
        const scale = panzoom.getScale()
        const realWidth = mapElem.clientWidth
        const realHeight = mapElem.clientHeight

        const scaledWidth = realWidth * scale

        const diffHorizontal = (scaledWidth - realWidth) / 2
        
        const viewableAreaWidth = mapElem.parentElement.clientWidth
        const viewableAreaHeight = mapElem.parentElement.clientHeight
        console.log(mapElem.parentElement)
        
        // x axis calculations
        const maxX = diffHorizontal / scale
        // how many pixels from the left the target is
        const xPos = realWidth * xPercent
        // maxX is on the left and the value gets lower moving left to right
        // this finds the position where the viewable area's left edge would run through the target's center
        const xLeftEdge = maxX - xPos
        // amount to shift the scene to compensate for the scale and the viewable area width
        const viewableHorizontalShift = viewableAreaWidth / 2 / scale
        // again the x-axis values get larger to the left so we need to add the viewableHorizontalShift so that it is centered
        const newX = viewableHorizontalShift + xLeftEdge + 500

        // y axis calculation
        const newY = viewableAreaHeight / 2 - realHeight * yPercent

        panzoom.pan(newX, newY, { duration: 200 })
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

    function layerFilter(y: number) {
        if (!MAPS[map] || !MAPS[map][floor]) return true;
        return MAPS[map][floor].top >= y && MAPS[map][floor].bottom <= y;
    }
</script>

<div class="mapContainer" class:full={$currentTab === null}>
    <select bind:value={map} on:change={() => setTimeout(() => { floor = lowestActiveFloor() }, 0)} class="mapSelector">
        <option value="r100">Zone 36 Central City</option>
        <option value="r200">Zone 33 Harmony Square</option>
        <option value="r240">Zone 33 Ark Transport</option>
        <option value="r300">Zone 09 Sector V</option>
        <option value="r310">Hermit Hideout</option>
        <option value="r400">Zone 32 Ark Mall</option>
        <option value="r500">Ark Sewers</option>
        <option value="r600">Aegis Research Institute</option>
        <option value="r800">Zone 09 Hal's Hideout</option>
        <option value="r840">Zone 30 Maison Forest</option>
        <option value="r900">Zone 10 Police HQ</option>
        <option value="r910">Highway Junction</option>
        <option value="r0">Mystery Zone</option>
        <option value="rb00">Astral Plane (no map available)</option>
        <option value="r940">Max's Safehouse</option>
    </select>
    {#if MAPS[map] && MAPS[map].length > 1}
    <select class="floorSelector" bind:value={floor}>
        {#each MAPS[map] as floorData, i}
            <option value={i}>{floorData.name}</option>
        {/each}
    </select>
    {/if}
    <div
        class="map"
        bind:this={mapElem}
        role="img"
        on:mousemove={calculateMouseCoords}
        on:panzoomstart={() => {cachedEm = $currentEm; $currentEm = null}}
        on:panzoomend={() => { panToEmEnabled = false; $currentEm = cachedEm; cachedEm = null; setTimeout(() => panToEmEnabled = true, 0)}}
    >
        <img src={`./maps/${map}/${floor}.svg`} alt="Map" />
        <div class="mapsBelow">
            {#each new Array(floor) as _, i}
                <img src={`./maps/${map}/${i}.svg`} alt="Map below" />
            {/each}
        </div>
        {#each ($session?.enemySet.sets || []) as set}
            {#each set.ems.filter(x => layerFilter(x.Trans.y)) as em}
                <MapEm em={em} set={set} cachedEm={cachedEm} on:click={() => { $currentTab = "enemySets"; $currentEm = em; panToEm(em) }} />
            {/each}
        {/each}
            <svg class="areas" height="4400" width="4400" xmlns="http://www.w3.org/2000/svg">
                {#if $showAreasOnMap}
                    {#each ($session?.questData.areas || []) as areaGroup}
                        {#each areaGroup.groups.filter(x => layerFilter(x.center.y)) as area}
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
                {/if}
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
        height: 4400px;
        width: 4400px;
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
    .mapSelector, .floorSelector {
        position: absolute;
        right: 5px;
        top: 5px;
        z-index: 10;
        font-size: unset;
        padding: 5px;
    }
    .floorSelector {
        top: 40px;
    }
    .mapsBelow {
        position: absolute;
        top: 0;
        left: 0;
        height: 4400px;
        width: 4400px;
        opacity: 0.2;
        z-index: -1;
        background-color: #000;
    }
    .mapsBelow > img {
        position: absolute;
        top: 0;
        left: 0;
    }
</style>