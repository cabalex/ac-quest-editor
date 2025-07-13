<script lang="ts">
	import { questType, questUnlookup, questLookup, em } from '../../../_lib/lookupTable';

	export let label: string;
	export let description: string | null = null;
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

	let pickerOpen = false;
</script>

<div class="input">
	<button class="emPicker btn" on:click={() => (pickerOpen = !pickerOpen)}>
		<h4>{questLookup(value)}</h4>
	</button>
	<select value={category} on:change={(e) => change(e.target.value, id)}>
		<option>em</option>
		<option>pl</option>
		<option>ba</option>
		<option>bh</option>
		<option>bg</option>
		<option>es</option>
		<option>et</option>
	</select>
	<input
		type="text"
		maxlength="4"
		{placeholder}
		value={id}
		on:change={(e) => change(category, e.target.value)}
	/>
</div>

{#if pickerOpen}
	<div class="emPickerDropdown">
		{#each Object.entries(em) as emId}
			<button class="emPickerOption" on:click={() => change(emId[0], emId[1])}>
				<div class="text">
					<h4>{emId[1]}</h4>
					<span>{emId[0]}</span>
				</div>
				<img src={`./icons/${emId[0]}.png`} alt="" />
			</button>
		{/each}
	</div>
{/if}

<style>
	.input {
		width: calc(100% - 20px);
		display: flex;
		align-items: center;
		flex-direction: row;
		gap: 10px;
		padding: 5px 10px;
		background-color: #333;
	}
	.emPicker {
		margin: 10px;
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		border-radius: 5px;
		align-items: flex-start;
	}
	.emPickerDropdown {
		position: fixed;
		max-height: 300px;
		background: #222;
		z-index: 10;
		width: 50%;
		box-shadow: 0 0 10px #000;
		border-radius: 10px;
		overflow-y: auto;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 5px;
	}
	.emPickerOption {
		background-color: #333;
		position: relative;
		overflow: hidden;
		display: block;
		width: 100%;
		height: 80px;
	}
	.emPickerOption:hover {
		background-color: #444;
	}
	.emPickerOption img {
		width: 50%;
		top: 0;
		right: 0;
		z-index: 0;
		position: absolute;
	}
	.emPickerOption .text {
		text-align: left;
		position: absolute;
		z-index: 2;
		left: 5px;
		top: 5px;
		width: 80%;
	}
	.emPickerOption .text span {
		font-size: 0.8em;
		font-weight: normal;
		color: #888;
	}
	input,
	.emPicker,
	select {
		font-size: 1em;
	}
	input,
	select {
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
	h4,
	p {
		margin: 0;
	}
</style>
