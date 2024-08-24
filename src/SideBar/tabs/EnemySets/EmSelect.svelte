<script lang="ts">
    import { questLookup } from "../../../_lib/lookupTable";

    export let label: string;
    export let description: string|null = null;
    export let placeholder = label;

    export let value = 0;


    $: category = (questLookup(value, true) || value.toString(16)).slice(0, 2);
    $: id = value.toString(16).slice(1);

    $: {
        if (category.length === 2 && id.length === 4) {
            change();
        }
    }

    function change() {
        value = parseInt(category + id, 16);
    }
</script>

<div class="input">
    <div class="text">
        <h4>{label}</h4>
        {#if description}
            <p>{description}</p>
        {/if}
    </div>
    <select bind:value={category}>
        <option>em</option>
        <option>pl</option>
        <option>ba</option>
        <option>bg</option>
        <option>es</option>
    </select>
    <input type="text" maxlength="4" placeholder={placeholder} bind:value={id} />
    {questLookup(value)}
</div>

<style>
    .input {
        width: calc(100% - 20px);
        display: flex;
        align-items: center;
        flex-direction: row;
        gap: 10px;
        padding: 5px 10px;
    }
    .text {
        margin: 10px;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
    }
    input, .text, select {
        font-size: 1em;
    }
    input, select {
        padding: 10px;
        border-radius: 5px;
        border: 1px solid #666;
        align-self: center;
    }
    input {
        width: 4ch;
    }
    select {
        font-size: unset;
        padding: 9px;
    }
    h4, p {
        margin: 0;
    }
</style>