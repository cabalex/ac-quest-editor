<script lang="ts">
    import Vector from "../_lib/Vector";

    export let label: string;
    export let description: string|null = null;
    export let placeholder = label;

    export let value = new Vector("0.000000 0.000000 0.000000 0.000000");
</script>

<div class="input">
    <div class="text">
        <h4>{label}</h4>
        {#if description}
            <p>{description}</p>
        {/if}
    </div>
    <div class="inputs">
        <span>X</span>
        <input type="number" placeholder="X" bind:value={value.x} />
        <span>Y</span>
        <input type="number" placeholder="Y" bind:value={value.y} />
        
        <span>Z</span>
        <input type="number" placeholder="Z" bind:value={value.z} />
        <span>W</span>
        <input type="number" placeholder="W" bind:value={value.w} />
    </div>
</div>

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
        width: 100px;
    }
    .inputs {
        display: grid;
        grid-template-columns: 20px 1fr 20px 1fr;
        align-items: center;
        gap: 10px;
    }
    .inputs span {
        text-align: right;
        font-weight: bold;
    }
    h4, p {
        margin: 0;
    }
</style>