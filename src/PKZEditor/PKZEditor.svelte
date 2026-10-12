<script lang="ts">
	import { slide } from 'svelte/transition';
	import extract, { type FileData, type PartialFile } from '../_lib/files/PKZ/extract';
	import repack from '../_lib/files/PKZ/repack';
	import extract_partial from '../_lib/files/PKZ/extract_partial';
	import PlatinumFileReader from '../_lib/files/PlatinumFileReader';
	import Loading from '../assets/Loading.svelte';
	import { IconFolder, IconLayoutNavbarExpand, IconReplace, IconTrash } from '@tabler/icons-svelte';

	interface AddReplacement {
		type: 'add';
		name: string;
		file: ArrayBuffer;
	}

	interface ReplaceReplacement {
		type: 'replace';
		name: string;
		file: ArrayBuffer;
	}

	interface DeleteReplacement {
		type: 'delete';
		name: string;
	}

	type Replacement = AddReplacement | ReplaceReplacement | DeleteReplacement;

	let pkzInput: HTMLInputElement;
	let pkzInputFileName: string = '';
	let loading = false;
	let step = 1;
	let pkzFileData: null | Awaited<ReturnType<typeof extract>> = null;
	let replacements: Replacement[] = [];
	async function handlePkzInput() {
		if (pkzInput.files && pkzInput.files.length > 0) {
			loading = true;
			const file = pkzInput.files[0];
			pkzInputFileName = file.name;
			pkzFileData = await extract(new PlatinumFileReader(file));
			loading = false;
			step = 2;
		}
	}

	async function handleFileUpload(type: 'add' | 'replace', name: string | null, e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			const file = input.files[0];
			const filename = name ?? file.name;
			replacements = [
				...replacements.filter((x) => !(x.name === filename && x.type === 'delete')),
				{
					// Some PKZs can have multiple files with the same name, but it's better
					// to treat added files as replacements if the user intends to replace an existing file
					// using the "Add file" button.
					type: pkzFileData?.files.find((x) => x.name === filename) ? 'replace' : type,
					name: filename,
					file: await file.arrayBuffer()
				}
			];
		}
		(e.target as HTMLInputElement).value = '';
	}

	async function openFile(ctx: FileData, file: FileData['files'][number]) {
		loading = true;
		const fullFile = await extract_partial(file, ctx);
	}

	let fileProgress = 0;
	async function repackPkz() {
		if (!pkzFileData) return;
		loading = true;

		const files: Array<PartialFile | { name: string; data: ArrayBuffer }> = [...pkzFileData.files];
		for (let replacement of replacements) {
			if (replacement.type === 'add') {
				files.push({ name: replacement.name, data: replacement.file });
			} else {
				const index = files.findIndex((x) => x.name === replacement.name);
				if (index !== -1) {
					if (replacement.type === 'replace') {
						files[index] = { name: replacement.name, data: replacement.file };
					} else {
						files.splice(index, 1);
					}
				} else {
					console.warn(`Replacement file "${replacement.name}" not found in PKZ.`);
				}
			}
		}

		const contents = await repack(files, 'ZStandard', pkzFileData, (progress) => {
			fileProgress = progress;
		});
		const blob = new Blob([contents], { type: 'application/octet-stream' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = pkzInputFileName;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		loading = false;
		fileProgress = 0;
	}
</script>

<div class="pkzEditor">
	<main>
		<h2>Repack PKZs</h2>
		<p>
			This is intended for debugging and lower-level usage. <b>This may use a lot of RAM!</b> If you're
			getting out of memory errors, try Firefox.
		</p>
		<div class="steps">
			<div
				class="step"
				class:active={step === 1}
				class:disabled={step < 1}
				class:completed={step > 1}
			>
				<div class="step-number">1</div>
				<h3>Select a PKZ file:</h3>
				<input
					type="file"
					bind:this={pkzInput}
					disabled={loading}
					accept=".pkz"
					on:change={handlePkzInput}
				/>
				{#if pkzFileData}
					<span class="small">{pkzFileData.files.length} files</span>
				{/if}
			</div>
			<div
				class="step"
				class:active={step === 2}
				class:disabled={step < 2}
				class:completed={step > 2}
			>
				<div class="step-number">2</div>
				<h3>Choose files to add, replace, or delete</h3>
				{#if pkzFileData !== null}
					<div class="scroller">
						{#each replacements.filter((x) => x.type === 'add') as replacement}
							<div class="file" transition:slide|global={{ duration: 200, axis: 'y' }}>
								<header>
									<span>{replacement.name} (adding file)</span>
									<button
										class="deleteBtn transparentBtn"
										title="Delete file"
										disabled={loading}
										on:click={() => (replacements = replacements.filter((x) => x !== replacement))}
									>
										<IconTrash />
									</button>
								</header>
							</div>
						{/each}
						{#each pkzFileData.files as file}
							{@const deleting = replacements.some(
								(x) => x.name === file.name && x.type === 'delete'
							)}
							{@const replacing = replacements.some(
								(x) => x.name === file.name && x.type === 'replace'
							)}
							<div
								class="file"
								class:deleted={deleting}
								class:replaced={replacing}
								transition:slide|global={{ duration: 200, axis: 'y' }}
							>
								<header>
									<span>
										{file.name}
										{#if replacing}
											<span class="small">(replacing file)</span>
										{/if}
									</span>
									{#if replacing || deleting}
										<button
											class="transparentBtn"
											title="Cancel"
											disabled={loading}
											on:click={() => {
												replacements = replacements.filter((x) => x.name !== file.name);
											}}
										>
											Cancel
										</button>
									{:else}
										<button
											class="transparentBtn"
											title="Replace file"
											disabled={loading || replacing}
											on:click={() => document.getElementById(`replace-${file.name}`)?.click()}
										>
											<IconReplace />
										</button>
										<!-- Todo: implement editing DAT contents -->
										<!-- {#if file.name.endsWith('.dat') || file.name.endsWith('.dtt')}
										<button
											class="transparentBtn"
											title="Edit file contents"
											disabled={true || loading}
										>
											<IconFolder />
										</button>
									{/if} -->
										<button
											class="deleteBtn transparentBtn"
											title="Delete file"
											disabled={loading}
											on:click={() => {
												replacements = [
													...replacements.filter((x) => x.name !== file.name),
													{
														name: file.name,
														type: 'delete'
													}
												];
											}}
										>
											<IconTrash />
										</button>
									{/if}
								</header>
							</div>
							<input
								type="file"
								id="replace-{file.name}"
								accept=".{file.name.split('.')[1]}"
								style="display: none"
								on:change={handleFileUpload.bind(null, 'replace', file.name)}
							/>
						{/each}
					</div>
				{/if}
				<input
					type="file"
					id="add-file"
					accept="*"
					style="display: none"
					on:change={handleFileUpload.bind(null, 'add', null)}
				/>
				<button
					disabled={pkzFileData === null || loading}
					class="addFile"
					style="width: 100%;"
					on:click={() => document.getElementById('add-file')?.click()}
				>
					Add file
				</button>
				<button
					disabled={pkzFileData === null || (loading && step === 2)}
					class="addBtn"
					class:loadingBtn={loading && step === 2}
					style="--loading-progress: {fileProgress * 100}%"
					on:click={repackPkz}
				>
					{#if loading && step === 2}
						<Loading style="width: 1em; height: 1em" text="Repacking..." />
					{:else}
						Repack
						{#if replacements.length > 0}
							with {replacements.length} {replacements.length === 1 ? 'change' : 'changes'}
						{:else}
							with no changes
						{/if}
					{/if}
				</button>
			</div>
			<div
				class="step"
				class:active={step === 3}
				class:disabled={step < 3}
				class:completed={step > 3}
			>
				<div class="step-number">3</div>
				<h3>Download completed file</h3>
			</div>
		</div>
	</main>
</div>

<style>
	.pkzEditor {
		width: 100%;
		max-height: 100%;
		overflow-y: auto;
	}
	.pkzEditor > main {
		padding: 10px 20px;
		max-width: 600px;
		margin: auto;
	}
	.steps {
		display: flex;
		flex-direction: column;
	}
	.step {
		position: relative;
		padding-left: 2.5em;
		padding-bottom: 2em;
		border-left: 2px solid #888;
		transition: border-color 0.3s ease;
	}
	.step.disabled {
		opacity: 0.5;
	}
	.step.completed {
		border-left-color: var(--primary-500);
	}
	.step.completed .step-number {
		background-color: var(--primary-500);
		color: white;
	}
	.step h3 {
		margin-top: 0.1em;
	}
	.step-number {
		position: absolute;
		left: calc(-1em - 1px);
		top: 0;
		background-color: #fff;
		color: black;
		width: 2em;
		height: 2em;

		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition:
			background-color 0.3s ease,
			color 0.3s ease;
	}
	.steps .step:last-child {
		border-left-color: transparent;
		padding-bottom: 0;
	}
	.small {
		font-size: 0.875rem;
		color: #888;
	}
	.scroller {
		max-height: 50vh;
		overflow-y: auto;
	}
	.file > header {
		display: flex;
		align-items: center;
		gap: 5px;
		padding: 5px;
		padding-left: 10px;
		background-color: #111;
		margin-bottom: 5px;
		border-radius: 10px;
	}
	.file.deleted > header {
		background-color: rgba(0, 0, 0, 0.2);
		color: #aaa;
	}
	.file.deleted > header > span {
		text-decoration: line-through;
	}
	.file .deleteBtn {
		width: unset;
		padding: 10px 20px;
	}
	.file span {
		flex-grow: 1;
	}
	.addFile {
		padding: 10px 20px;
	}
	.loadingBtn {
		position: relative;
		overflow: hidden;
		background-color: rgba(0, 0, 0, 0.4);
	}
	.loadingBtn:after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		background-color: var(--primary-500);
		width: var(--loading-progress);
		border-radius: 2px;
		z-index: -1;
	}
</style>
