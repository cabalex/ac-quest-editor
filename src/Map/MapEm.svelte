<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { questLookup } from "../_lib/lookupTable";
    import type { Em, EmSet } from "../_lib/types/EnemySet";
    import { currentEm } from "../store";

    export let em: Em;
    export let cachedEm: Em|null;
    export let set: EmSet;

    const toMap = (coord: number) => 2200 + coord * 2;

    const dispatch = createEventDispatcher();


    let cachedPos = "0.000000 0.000000 0.000000 0.000000"

    let x = toMap(-em.Trans.z) - 2;
    let y = toMap(em.Trans.x) - 2;
    $: {
        if (cachedPos !== em.Trans.repack() || (cachedEm === em && cachedPos !== cachedEm.Trans.repack())) {
            cachedPos = em.Trans.repack();
            x = toMap(-em.Trans.z) - 2;
            y = toMap(em.Trans.x) - 2;
        }
    }
</script>

<div
    class="em"
    class:active={$currentEm === em || cachedEm === em}
    class:nearby={($currentEm && cachedEm) && set.ems.includes($currentEm || cachedEm)}
    role="button"
    tabindex="0"
    on:click={(e) => {dispatch("click", em); e.stopPropagation()}}
    style={`left: ${x}px; top: ${y}px; transform: rotate(${-em.Rotation - Math.PI / 2}rad); background-color: hsl(${set.number * 10}, 50%, 60%)`}
>
{#if (questLookup(em.Id) || "").startsWith("No")}
    <div class="wall" style={`width: ${(em.SetType || em.ExSetTypeA || em.ExSetTypeB) * 2}px`} />
{/if}
</div>
{#if em.secondaryObjectEnabled}
<div
    class="em secondary"
    class:active={$currentEm === em || cachedEm === em}
    class:nearby={($currentEm && cachedEm) && set.ems.includes($currentEm || cachedEm)}
    role="button"
    tabindex="0"
    on:click={(e) => {dispatch("click", em); e.stopPropagation()}}
    style={`top: ${toMap(em.TransL.x) - 2}px; left: ${toMap(-em.TransL.z) - 2}px; transform: rotate(${em.Rotation + Math.PI / 2}rad); background-color: hsl(${set.number * 10}, 50%, 60%)`}
/>
{/if}

<style>
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