<script lang="ts">
    import { questType, questUnlookup, questLookup } from "../../../_lib/lookupTable";

    export let label: string;
    export let description: string|null = null;
    export let placeholder = label;

    export let value = 0;


    let category = questType(value);
    let id = value.toString(16).slice(1);

    function change(newCategory: string, newId: string) {
        if (!isNaN(parseInt(newId, 16))) {
            id = newId;
        }
        category = newCategory;
        value = questUnlookup(category + id);
    }
</script>

<div class="input">
    <div class="text">
        <h4>{label}</h4>
        {#if description}
            <p>{description}</p>
        {/if}
        {questLookup(value)}
    </div>
    <select value={category} on:change={(e) => change(e.target.value, id)}>
        <option>em</option>
        <option>pl</option>
        <option>ba</option>
        <option>bg</option>
        <option>es</option>
    </select>
    <input type="text" maxlength="4" placeholder={placeholder} value={id} on:change={(e) => change(category, e.target.value)} />
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