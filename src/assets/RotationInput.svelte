<script lang="ts">
    import { IconCaretUpFilled } from "@tabler/icons-svelte";

    export let label: string;
    export let description: string|null = null;
    export let placeholder = label;

    // The value is in radians.
    export let value = 0;

    function changeDegrees(e: any) {
        value = (e.target.value % 360) * Math.PI / 180;
    }

    let center: { x: number, y: number }|null = null;
    let elem: HTMLDivElement;
    function onDown(e: any){
        if (!elem) return;
        const rect = elem.getBoundingClientRect();
        center = { x: rect.x + (rect.width / 2), y: rect.y + (rect.height / 2) };
    }

    function onUp() {
        center = null;
    }


    function onMove(e: any) {
        if (!center) return;
        // Modified code from
        // https://dev.to/ndesmic/how-to-make-a-rotational-knob-input-with-web-components-43e3
        const offsetX = e.clientX - center.x;
        const offsetY = center.y - e.clientY;  //y-coords flipped
        let rad;
        if (offsetX >= 0 && offsetY >= 0){ rad = Math.atan(offsetY / offsetX); }
        else if (offsetX < 0 && offsetY >= 0) { rad = (Math.PI / 2) + Math.atan(-offsetX / offsetY); }
        else if (offsetX < 0 && offsetY < 0) { rad = Math.PI + Math.atan(offsetY / offsetX); }
        else { rad = (3 * Math.PI / 2) + Math.atan(offsetX / -offsetY); }

        // snap to notches
        if ((rad + 0.1) % (Math.PI / 4) < 0.2) rad = Math.round(rad / (Math.PI / 4)) * (Math.PI / 4);
        
        value = rad - Math.PI;
    }

    $: degrees = (value * 180 / Math.PI).toFixed(2);

    $: transform = `translate(${Math.sin(-value - Math.PI / 2) * 60 - 12}px, ${-Math.cos(-value - Math.PI / 2) * 60 - 12}px) rotate(${-value - Math.PI / 2}rad)`;
</script>

<div class="input">
    <div class="text">
        <h4>{label}</h4>
        {#if description}
            <p>{description}</p>
        {/if}
    </div>
    <input type="number" style="width: 70px" placeholder={placeholder} value={degrees} on:change={changeDegrees} />
    <span>degrees</span>
    <div class="rotationPicker" bind:this={elem} on:mousedown={onDown} on:mouseup={onUp} on:mousemove={onMove}>
        <div class="knob" style={`transform: ${transform}`}>
            <IconCaretUpFilled />
        </div>
        {#each Array(8) as _, i}
            <div class="notch" style={`transform: rotate(${i * Math.PI / 4}rad) translateY(50px)`} />
        {/each}
    </div>
</div>

<svelte:document on:mousemove={onMove} on:mouseup={onUp} />

<style>
    .input {
        width: calc(100% - 20px);
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 10px;
        padding: 5px 10px;
    }
    .text {
        margin: 10px;
        display: flex;
        flex-direction: column;
    }
    input, .text {
        flex-grow: 1;
        font-size: 1em;
    }
    input {
        padding: 10px;
        border-radius: 5px;
        border: 1px solid #666;
        align-self: center;
    }
    h4, p {
        margin: 0;
    }
    .rotationPicker {
        aspect-ratio: 1 / 1;
        height: 120px;
        position: relative;
        background-color: #222;
        border-radius: 100%;
        border: 2px solid #555;
        margin: 10px;
    }
    input {
        flex-grow: 0;
        width: 70px;
    }
    .knob {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 20px;
        height: 20px;
        background-color: #888;
        border-radius: 100%;
        border: 2px solid #999;
        user-select: none;
        cursor: pointer;
        z-index: 3;

        display: flex;
        align-items: center;
        justify-content: center;
    }
    .knob:after {
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        width: 2px;
        height: 48px;
        background-color: #999;
        transform: translateX(-50%);
    }
    .notch {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 2px;
        height: 10px;
        background-color: #999;
        transform-origin: 0 0;
        transform: translate(-1px, -5px);
    }
</style>