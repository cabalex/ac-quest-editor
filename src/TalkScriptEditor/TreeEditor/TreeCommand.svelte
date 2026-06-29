<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { StateCommand, Script } from '../../_lib/types/TalkScript';
	import TextInput from '../../assets/TextInput.svelte';
	import NumberInput from '../../assets/NumberInput.svelte';
	import {
		IconArrowUpRight,
		IconCamera,
		IconCircleChevronRight,
		IconCircleDashedX,
		IconClock,
		IconCoin,
		IconExclamationMark,
		IconFlag,
		IconFlagOff,
		IconMessage,
		IconMessage2,
		IconMessageReport,
		IconMoodSmile,
		IconMusic,
		IconPhone,
		IconPlanetOff,
		IconQuestionMark,
		IconShoppingBag,
		IconSquareMinus,
		IconSquarePlus,
		IconTrash,
		IconWashDryShade,
		IconXboxB
	} from '@tabler/icons-svelte';
	import LongTextInput from '../../assets/LongTextInput.svelte';

	export let command: StateCommand;
	export let stateInfo: Script['stateInfos'][number];
	export let script: Script;

	const dispatch = createEventDispatcher();

	function getState(command: StateCommand) {
		if (command.type === 0 && (isChoiceCommand(command) || isAnserCommand(command))) {
			return command.args[2];
		}
		if (command.type === 999) {
			return command.args[0];
		}

		return '';
	}

	function isChoiceCommand(command: StateCommand) {
		let isChoice = false;
		for (const comm of stateInfo.commands) {
			if (comm === command) {
				return isChoice;
			}
			if (comm.type === 0 && comm.args[1] === 'select') {
				// select is the main one;
				// anser is used for investigation segments
				isChoice = true;
			}
		}
		return false;
	}

	function isAnserCommand(command: StateCommand) {
		let isAnser = false;
		for (const comm of stateInfo.commands) {
			if (comm === command) {
				return isAnser;
			}
			if (comm.type === 0 && comm.args[1] === 'anser') {
				// select is the main one;
				// anser is used for investigation segments
				isAnser = true;
			}
		}
		return false;
	}

	$: isChoice = isChoiceCommand(command);
	$: isAnser = isAnserCommand(command);
	$: state = getState(command);

	function confirmDelete() {
		if (confirm(`Are you sure you want to delete this command? This cannot be undone.`)) {
			dispatch('delete');
		}
	}
</script>

<div class="tree-command">
	<div
		class={'command-body ' + (state ? 'jumper ' : '') + state}
		class:choice={isChoice && command.type === 0}
		class:anser={isAnser && command.type === 0}
	>
		{#if command.type === 0}
			<!-- Say a blocking message -->
			{#if command.args[1] === 'select'}
				<div class="row">
					<IconQuestionMark />
					Ask question
				</div>
				<div class="row">
					<textarea placeholder="Ask question" bind:value={command.message} />
				</div>
			{:else if isChoice}
				<div class="row">
					{#if command.args[0] === 'select:cancel'}
						<IconXboxB />
					{:else if command.args[1].startsWith('money:')}
						<IconCoin />
					{:else}
						<IconCircleChevronRight />
					{/if}
					<textarea placeholder="Say message" bind:value={command.message} />
				</div>
			{:else if command.args[1] === 'anser'}
				<div class="row">
					<IconExclamationMark />
					Ask for evidence
				</div>
				<div class="row">
					<textarea placeholder="Ask for evidence" bind:value={command.message} />
				</div>
			{:else if isAnser}
				<div class="row">
					<IconMessageReport />
					<textarea placeholder="Say message" bind:value={command.message} />
				</div>
			{:else}
				<div class="row">
					<IconMessage />
					<textarea placeholder="Say message" bind:value={command.message} />
				</div>
			{/if}
		{:else if command.type === 1}
			<!-- Say a non-blocking message -->
			<div class="row">
				<IconMessage />
				Say message (non-blocking?)
			</div>
			<div class="row">
				<textarea placeholder="Say message" bind:value={command.message} />
			</div>
		{:else if command.type === 2}
			<div class="row">
				<IconClock />
				Wait
				<input type="number" placeholder="Time" bind:value={command.args[0]} /> frames ({(
					parseInt(command.args[0]) / 30
				).toFixed(2)}s)
			</div>
		{:else if [3, 6, 8].includes(command.type)}
			<!-- Set global/save/quest flag to true -->
			<div class="row">
				<IconFlag />
				Set {command.type === 3 ? 'Global flag' : command.type === 6 ? 'SaveFlag' : 'QuestFlag'}
				<input type="text" placeholder="Flag name" bind:value={command.args[0]} /> to true
			</div>
		{:else if [4, 7, 9].includes(command.type)}
			<!-- Set global/save/quest flag to false -->
			<div class="row">
				<IconFlagOff />
				Set {command.type === 4 ? 'Global flag' : command.type === 7 ? 'SaveFlag' : 'QuestFlag'}
				<input type="text" placeholder="Flag name" bind:value={command.args[0]} /> to false
			</div>
		{:else if command.type === 10 || command.type === 11}
			<!-- Add/remove item from player's inventory. -->
			<div class="row">
				{#if command.type === 10}
					<IconSquarePlus />
				{:else}
					<IconSquareMinus />
				{/if}
				{command.type === 10 ? 'Add item' : 'Remove item'}
				<input type="text" placeholder="Item ID" bind:value={command.args[0]} />
			</div>
			{#if command.args[1] === 'table'}
				<div class="row" style="font-size: 0.8em;">
					(taking from core/talkscript_item_table.bxm.)
				</div>
			{/if}
		{:else if command.type === 12 || command.type === 13}
			<!-- Add/take money using the table system (or just a number) -->
			<div class="row">
				{#if command.type === 12}
					<IconSquarePlus />
				{:else}
					<IconSquareMinus />
				{/if}
				{command.type === 12 ? 'Give money' : 'Take money'}
				<input type="text" placeholder="Amount in G" bind:value={command.args[0]} />
				{command.args[0].startsWith('0x') ? '' : 'G'}
			</div>
			{#if command.args[1] === 'table'}
				<div class="row" style="font-size: 0.8em;">
					(taking from core/talkscript_item_table.bxm.)
				</div>
			{/if}
			<!-- No Type 14 in game -->
		{:else if command.type === 15}
			<div class="row">Add pin to map (???)</div>
			<!-- No Type 16 in game, but presumably it's "remove pin from map"? -->
		{:else if command.type === 17}
			<div class="row">Add pin to map</div>
		{:else if command.type === 18}
			<!-- Emote the NPC (or player with pl)-->
			<div class="row">
				<IconMoodSmile />
				Have <input type="text" placeholder="Item ID" bind:value={command.args[1]} /> emote
				<input type="text" placeholder="Emote ID" bind:value={command.args[0]} />
			</div>
			<!-- No Type 19 in game -->
		{:else if command.type === 20 || command.type === 21}
			<!-- Display a message above the NPC's head-->
			<div class="row">
				<IconMessage2 />
				<textarea
					class="above-head"
					placeholder="Say message above head"
					bind:value={command.message}
				/>
			</div>
			<div class="row" style="font-size: 0.8em;">(High priority speech bubble)</div>
		{:else if command.type === 22}
			<div class="row">
				<IconCamera />
				Set camera mode to
				<select bind:value={command.args[0]}>
					<option value="" disabled></option>
					<option value="normal">Normal</option>
					<option value="free">Free</option>
					<option value="back">Back</option>
					<option value="pl">PL</option>
					<option value="pl_face">PL (Face)</option>
					<option value="pl_squat">PL (Squat)</option>
					<option value="target">Target</option>
					<option value="target_face">Target (Face)</option>
				</select>
			</div>
			{#if command.args[0] === 'free'}
				<div class="row">
					with position <input type="text" placeholder="Position" bind:value={command.args[1]} />
				</div>
				<div class="row">
					facing location <input
						type="text"
						placeholder="Target location"
						bind:value={command.args[2]}
					/>
				</div>
			{:else}
				<div class="row">
					with zoom (optional) <input
						type="text"
						placeholder="Zoom level"
						bind:value={command.args[1]}
					/>
				</div>
			{/if}
		{:else if command.type === 23}
			<div class="row">
				<IconCamera />
				Point camera at
				<input type="text" placeholder="Jump to" bind:value={command.args[1]} />
			</div>
			<div class="row">
				from position <input type="text" placeholder="From position" bind:value={command.args[0]} />
			</div>
			<div class="row">
				with zoom (optional) <input
					type="text"
					placeholder="Zoom level"
					bind:value={command.args[2]}
				/>
			</div>
		{:else if command.type === 24}
			<div class="row">
				<IconPhone />
				<textarea placeholder="Say message" bind:value={command.message} />
			</div>
		{:else if command.type === 25}
			<div class="row">
				<IconWashDryShade />
				Fade out for <input type="text" placeholder="Arg 1" bind:value={command.args[0]} /> frames ({(
					parseInt(command.args[0]) / 30
				).toFixed(2)}s)
			</div>
		{:else if command.type === 27}
			<div class="row">
				<IconPlanetOff />
				Prevent dialogue from being skipped
				{#if command.args[0] === 'notalkskip'}
					until end of dialogue (notalkskip)
				{:else}
					for <input type="text" placeholder="Frames" bind:value={command.args[0]} /> frames ({(
						parseInt(command.args[0]) / 30
					).toFixed(2)}s)
				{/if}
			</div>
		{:else if command.type === 28}
			<!-- Open shop menu -->
			<div class="row">
				<IconShoppingBag />
				Open shop menu <input type="text" placeholder="Shop ID" bind:value={command.args[0]} />
			</div>
		{:else if command.type === 35}
			<!-- Play sound -->
			<div class="row">
				<IconMusic />
				Play sound <input type="text" placeholder="Sound ID" bind:value={command.args[0]} />
			</div>
		{:else if command.type === 999}
			<div class="row">
				{#if command.args[1] === 'run'}
					<IconArrowUpRight />
					Jump to
				{:else}
					<IconCircleDashedX />
					End dialogue; start again at
				{/if}
				<input type="text" placeholder="Jump to" bind:value={command.args[0]} />
			</div>
		{:else}
			<NumberInput label="Type" bind:value={command.type} />
			<TextInput label="Arg 1" bind:value={command.args[0]} />
			<TextInput label="Arg 2" bind:value={command.args[1]} />
			<TextInput label="Arg 3" bind:value={command.args[2]} />
			<LongTextInput label="Message" bind:value={command.message} />
		{/if}
		<div class="small-args">
			<input type="number" style="width: 3ch" placeholder="Type" bind:value={command.type} />
			<input type="text" placeholder="Arg 1" bind:value={command.args[0]} />
			<input type="text" placeholder="Arg 2" bind:value={command.args[1]} />
			<input type="text" placeholder="Arg 3" bind:value={command.args[2]} />
		</div>
	</div>
	<button class="deleteBtn" on:click={confirmDelete}>
		<IconTrash />
	</button>
</div>

<style>
	.tree-command {
		display: flex;
		align-items: center;
		border-bottom: 1px solid #555;
	}
	:global(.tree-command .input) {
		flex-direction: column;
		align-items: flex-start;
	}
	.command-body {
		display: flex;
		flex-direction: column;
		width: 100%;
		overflow: hidden;
	}
	.command-body.choice .row textarea,
	.command-body.anser .row textarea {
		height: 1.5em;
		min-height: 1.5em;
	}
	:global(.command-body.choice .row svg, .command-body.anser .row svg) {
		margin-left: 30%;
	}
	.command-body.jumper .row {
		border-left: 3px solid var(--primary-500);
		padding-left: 2px;
	}
	.command-body.anser .row {
		border-left: 3px solid var(--secondary);
		padding-left: 2px;
	}
	.row {
		padding: 5px;
		display: flex;
		align-items: flex-start;
		white-space: nowrap;
		gap: 10px;
		line-height: 2;
		position: relative;
	}
	:global(
		.row:has(svg):has(textarea) svg,
		.row:has(svg):has(input) svg,
		.row:has(svg):has(select) svg
	) {
		margin-top: 5px;
	}
	.row + .row {
		padding-top: 0;
	}
	.row:not(:has(svg:first-child)) {
		margin-left: 32px;
	}
	.row input,
	.row textarea,
	.row select {
		width: 100%;
		font-size: unset;
		font-family: unset;
		padding: 4px;
		border-radius: 0;
		resize: none;
	}
	.row textarea {
		min-height: 75px;
	}
	textarea.above-head {
		text-align: center;
		min-height: 3em;
		height: 3em;
		margin-bottom: 10px;
		position: relative;
	}
	.row:has(textarea.above-head):before {
		content: '';
		background-color: #555;
		width: 20px;
		height: 10px;
		position: absolute;
		bottom: 5px;
		left: calc(50% + 24px);
		clip-path: polygon(0 0, 100% 0, 50% 100%);
		transform: translateX(-50%);
	}
	.small-args {
		display: flex;
	}
	.small-args input {
		width: 100%;
		font-size: 10px;
		padding: 2px;
		border-radius: 0;
		background-color: #222;
		border: 1px solid #333;
		border-top-color: #2a2a2a;
		color: #aaa;
	}
	.small-args input[type='number'] {
		-webkit-appearance: none;
		-moz-appearance: textfield;

		appearance: textfield;
	}

	.small-args input[type='number']::-webkit-outer-spin-button,
	.small-args input[type='number']::-webkit-inner-spin-button {
		-webkit-appearance: none;
	}
	.deleteBtn {
		width: 30px;
		border-radius: 0;
		align-self: stretch;
	}
	.deleteBtn:not(:hover) {
		background-color: #333;
	}
</style>
