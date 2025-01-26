<script lang="ts">
	import { tick } from 'svelte';

	export let value: string;
	export let style = '';

	interface Text {
		type: 'TEXT';
		value: string;
		color: string;
		scale: string;
		font: string;
	}
	interface Character {
		type: 'BTN';
		code: string;
		color: string;
		scale: string;
	}

	type Fragment = Text | Character;

	function render(value: string) {
		const texts = value.split(/(\[.+?)\]/);
		let fragments: Fragment[] = [];
		let currentColor = 'N ';
		let currentFont = 'N ';
		let currentScale = 'N ';
		for (let i = 0; i < texts.length; i++) {
			if (texts[i].startsWith('[BTN')) {
				fragments.push({
					type: 'BTN',
					code: texts[i].split(':')[1],
					color: currentColor,
					scale: currentScale
				});
			} else if (texts[i].startsWith('[COLOR')) {
				currentColor = texts[i].split(':')[1];
            } else if (texts[i].startsWith('[FONT')) {
                currentFont = texts[i].split(':')[1];
            } else if (texts[i].startsWith('[SCALE')) {
                currentScale = texts[i].split(':')[1];
			} else {
				fragments.push({
					type: 'TEXT',
					value: texts[i],
					color: currentColor,
					scale: currentScale,
					font: currentFont
				});
			}
		}
		return fragments;
	}
	$: fragments = render(value);

	let focused = false;
</script>

<div
	class="astralChainText"
	{style}
	role="textbox"
	tabindex="0"
	on:focus={() => (focused = true)}
	on:click={() => (focused = true)}
>
	<textarea bind:value style={focused ? '' : 'opacity: 0'} on:blur={() => (focused = false)}
	></textarea>
	{#if !focused}
		<div class="rendered">
			{#each fragments as fragment}
				{#if fragment.type === 'TEXT'}
					<span class="color-{fragment.color} font-{fragment.font} scale-{fragment.scale}"
						>{fragment.value}</span
					>
				{:else if fragment.type === 'BTN'}
					<span class="btnCode color-{fragment.color}">{fragment.code}</span>
				{/if}
			{/each}
		</div>
	{/if}
</div>

<style>
	.astralChainText {
		display: flex;
		flex-wrap: wrap;
		background-color: #444;
		border-radius: 5px;
		position: relative;
	}
	.rendered {
		padding: 10px;
		white-space: pre-line;
		overflow-y: auto;
		height: 100%;
	}
	.btnCode {
		background-color: #000;
		color: #fff;
		min-width: 18px;
		padding: 0 5px;
		height: 28px;
		border-radius: 100px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}
	textarea {
		position: absolute;
		top: 0;
		left: 0;
		height: calc(100% - 20px);
		width: calc(100% - 20px);
		font-family: unset;
		padding: 10px;
		border-radius: 5px;
		border: 1px solid #666;
		resize: none;
		font-size: 1em;
	}
	:global(.color-N) {
		color: #ffffff;
	}
	:global(.color-1) {
		color: #e8465a;
	}
	:global(.color-2) {
		color: #3c3744;
	}
	:global(.color-3) {
		color: #0000ff;
	}
	:global(.color-4) {
		color: #808080;
	}
	:global(.color-5) {
		color: #ffff00;
	}
    :global(.font-1) {
        font-family: 'Arial';
    }
    :global(.font-2) {
        font-family: 'Courier New';
    }
    :global(.scale-L) {
        font-size: 1.5em;
    }
    :global(.scale-XL) {
        font-size: 2em;
    }
    :global(.scale-S) {
        font-size: 0.75em;
    }
</style>
