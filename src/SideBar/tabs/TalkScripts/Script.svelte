<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { slide } from "svelte/transition";
    import { cubicInOut } from "svelte/easing";
    import { IconCaretRightFilled, IconCode, IconPencil, IconScript, IconTrash, IconUser } from "@tabler/icons-svelte";
    import type { Script } from "../../../_lib/types/TalkScript";
    import NumberInput from "../../../assets/NumberInput.svelte";
    import TextInput from "../../../assets/TextInput.svelte";
    import { currentTalkScript, session, currentTask, currentTab, currentEm } from "../../../store";
  import SelectInput from "../../../assets/SelectInput.svelte";
  import { questLookup } from "../../../_lib/lookupTable";
  import type { Em } from "../../../_lib/types/EnemySet";

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
                    questLookup(em.Ids[0].toString(16), true)?.toUpperCase() === emName.toUpperCase() &&
                    em.SetType === type
                )
                    return [`${emSet.name} (${emSet.number})`, em];
            }
        }
        return null;
    }

    $: references = script.triggerType === 1 ? taskReferences() : [];
    $: emReference = script.triggerType !== 1 ? getEmReference(script.objId, script.setType) : null;
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
        <IconScript />
        <div class="text">
            <h3>{script.objId}</h3>
            {#if script.triggerType === 1}
            <span>{script.questId}</span>
            {:else}
            <span>{script.questId} - SetType {script.setType}</span>
            {/if}
        </div>
        <IconPencil />
    </header>
    <div class="referencedTasks">
        {#if references}
            {#each references as reference}
                <button class="referencedTask" on:click={() => { $currentTask = reference[1]; $currentTab = "tasks"}}>
                    <IconCode />
                    <span translate="yes">{reference[0]}</span>
                </button>
            {/each}
        {/if}
        {#if emReference}
        <button class="referencedTask" on:click={() => { $currentEm = (emReference || [null, null])[1]; $currentTab = "enemySets"}}>
            <IconUser />
            <span translate="yes">{emReference[0]}</span>
        </button>
        {/if}
    </div>
    {#if expanded}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="content" transition:slide={{axis: 'y', duration: 100, easing: cubicInOut}} on:click={(e) => e.stopPropagation()}>
        <SelectInput
            label="Triggered by"
            bind:value={script.triggerType}
        >
            <option value="0">NPC interaction</option>
            <option value="1">Task</option>
            <option value="2">Speech bubble</option>
        </SelectInput>
        {#if script.triggerType !== 1}
            <TextInput
                label="Object ID"
                description="Use normal IDs, e.g. pl2002."
                bind:value={script.objId}
            />
            <NumberInput
                label="SetType"
                description="A matching entity in the Enemy Sets should have this value. This can be 0 if you only have one entity of this name."
                bind:value={script.setType}
            />
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
            Delete task
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
    .content h2.sectionHeader {
        padding-left: 10px;
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
</style>