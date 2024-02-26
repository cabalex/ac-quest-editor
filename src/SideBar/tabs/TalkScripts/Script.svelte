<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { slide } from "svelte/transition";
    import { cubicInOut } from "svelte/easing";
    import { IconCaretRightFilled, IconCode, IconMessage, IconMessage2, IconMessageCode, IconPencil, IconScript, IconTrash, IconUser } from "@tabler/icons-svelte";
    import type { Script } from "../../../_lib/types/TalkScript";
    import TextInput from "../../../assets/TextInput.svelte";
    import { currentTalkScript, session, currentTask, currentTab, currentEm } from "../../../store";
    import { questLookup } from "../../../_lib/lookupTable";
    import type { Em } from "../../../_lib/types/EnemySet";
    import SelectNumberInput from "../../../assets/SelectNumberInput.svelte";
    import SelectStringInput from "../../../assets/SelectStringInput.svelte";

    export let script: Script;

    const dispatch = createEventDispatcher();

    function confirmDelete() {
        if (confirm(`Are you sure you want to delete the Script for ${script.objId}? This cannot be undone.`)) {
            dispatch("delete", script);
            if ($currentTalkScript === script) $currentTalkScript = null;
        }
    }

    let expanded = false;


    function taskReferences() {
        if ($session === null || script.triggerType !== 1) return [];

        let references: [string, number][] = [];
        for (let i = 0; i < $session.questData.tasks.length; i++) {
            let task = $session.questData.tasks[i];
            for (let lineList of task.lineLists) {
                for (let command of lineList) {
                    if (command.EXECArgs?.TalkId) {
                        let obj = "0x" + parseInt(command.EXECArgs?.TalkId || "").toString(16).padStart(4, "0");
                        if (obj === script.objId) {
                            references.push([task.name, i]);
                            break;
                        }
                    }
                }
            }
        }
        return references;
    }

    function getEmReference(emName: string, type: number): [string, Em]|null {
        if ($session === null) return null;

        for (let emSet of $session.enemySet.sets) {
            for (let em of emSet.ems) {
                if (
                    questLookup(em.Id.toString(16), true)?.toUpperCase() === emName.toUpperCase() &&
                    em.SetType === type
                )
                    return [`${emSet.name} (${emSet.number}) > ${questLookup(em.Id.toString(16))}`, em];
            }
        }
        return null;
    }

    function changeEmReference(e: any) {
        // get the optgroup that the option is in
        let opt = e.detail[1].target.querySelector(`option[value="${e.detail[0]}"]`);
        let optgroup = opt?.parentElement?.label;
        if (opt && optgroup) {
            let index = parseInt(opt.dataset.index);
            let emSet = $session?.enemySet.sets.find(set => set.number === parseInt(optgroup));
            let em = emSet?.ems[index];
            if (emSet && em) {
                $session?.changeTalkScriptReference(script, em);
                // since this mutates the ems and script, we need to
                // refresh the state in component
                script.objId = script.objId;
                emDropdown = emDropdownOptions();
            }
        }
    }

    $: references = script.triggerType === 1 ? taskReferences() : [];
    $: emReference = script.triggerType !== 1 ? getEmReference(script.objId, script.setType) : null;


    function emDropdownOptions(): {[key: string]: [string, string][]} {
        let options: {[key: string]: [string, string][]} = {};
        for (let set of ($session?.enemySet.sets || [])) {
            let arr: [string, string][] = [];
            for (let em of set.ems) {
                arr.push([
                    `${questLookup(em.Id.toString(16), true)?.toLowerCase()}-${em.SetType}`,
                    `${questLookup(em.Id.toString(16))}`
                ]);
            }
            options[`${set.number} - ${set.name}`] = arr;
        }
        return options;
    }

    let emDropdown = emDropdownOptions();
</script>

<div
    class="script"
    class:open={expanded}
    class:active={$currentTalkScript == script}
    role="button"
    tabindex="0"
    on:click={() => $currentTalkScript = $currentTalkScript === script ? null : script}
    transition:slide={{duration: 100, easing: cubicInOut}}
>
    <header>
        <button class="expand" class:active={expanded} on:click={(e) => { expanded = !expanded; e.stopPropagation(); }}>
            <IconCaretRightFilled />
        </button>
        {#if script.triggerType === 0}
            <IconMessage />
        {:else if script.triggerType === 1}
            <IconMessageCode />
        {:else}
            <IconMessage2 />
        {/if}
        <div class="text">
            {#if script.triggerType === 1}
            <h3>{script.objId}</h3>
            <span>{script.questId}</span>
            {:else}
            <h3 translate="yes">{(emReference || [script.objId])[0]}</h3>
            <span>{script.questId} - SetType {script.setType}</span>
            {/if}
        </div>
        <IconPencil />
    </header>
    {#if references.length > 0}
    <div class="referencedTasks">
            {#each references as reference}
                <button class="referencedTask" on:click={(e) => { $currentTask = reference[1]; $currentTab = "tasks"; e.stopPropagation()}}>
                    <IconCode />
                    <span translate="yes">{reference[0]}</span>
                </button>
            {/each}
    </div>
    {/if}
    {#if expanded}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="content" transition:slide={{axis: 'y', duration: 100, easing: cubicInOut}} on:click={(e) => e.stopPropagation()}>
        <SelectNumberInput
            label="Triggered by"
            bind:value={script.triggerType}
        >
            <option value="0">NPC interaction</option>
            <option value="1">Task</option>
            <option value="2">Speech bubble</option>
        </SelectNumberInput>
        {#if script.triggerType !== 1}
            <SelectStringInput
                value={`${script.objId.toLowerCase()}-${script.setType}`}
                label="Object to reference"
                on:change={changeEmReference}
            >
                {#each Object.keys(emDropdown) as set}
                    <optgroup label={set}>
                        {#each emDropdown[set] as em, i}
                            <option data-index={i} value={em[0]}>{em[1]}</option>
                        {/each}
                    </optgroup>
                {/each}
            </SelectStringInput>
            {#if emReference}
                <h2 class="sectionHeader">Jump to object</h2>
                <button class="referencedTask" style="margin: 10px" on:click={() => { $currentEm = (emReference || [null, null])[1]; $currentTab = "enemySets"}}>
                    <IconUser />
                    <span translate="yes">{emReference[0]}</span>
                </button>
            {/if}
        {:else}
            <TextInput
                label="Hex key"
                description="This value (of form 0xXXXX, e.g. 0x500) should be used to call the Talk Script from your Task."
                bind:value={script.objId}
            />
        {/if}
        <TextInput
            label="Quest ID"
            description="Defaults to qffff."
            bind:value={script.questId}
        />
        <button class="deleteBtn" on:click={confirmDelete}>
            <IconTrash />
            Delete Talk Script
        </button>
    </div>
    {/if}
</div>

<style>
    header {
        cursor: pointer;
        transition: 0.1s ease-in-out;
        border-radius: 10px 10px;
    }
    .content {
        border-top: 1px solid #333;
    }
    .script {
        width: calc(100% - 10px);
        background-color: #444;
        margin: 5px;
        border-radius: 10px;
    }
    .script.active header {
        background-color: #666;
    }
    .script.open header {
        border-radius: 10px 10px 0 0;
    }
    .text > * {
        margin: 0;
    }
    button.expand {
        padding: 5px;
        border-radius: 100%;
        transition: transform 0.1s;
    }
    button.expand.active {
        transform: rotate(90deg);
    }
    button.deleteBtn {
        width: 100%;
        padding: 10px;
        border-radius: 0 0 10px 10px;
        color: var(--danger);
        transition: 0.2s;
    }
    button.deleteBtn:hover {
        background-color: var(--danger);
        color: white;
    }
    .referencedTasks {
        display: flex;
        flex-wrap: wrap;
        margin: 5px;
    }
    .referencedTask {
        padding: 5px;
        margin: 5px;
        text-align: left;
    }
    .content h2.sectionHeader {
        margin-left: 10px;
    }
</style>