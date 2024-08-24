<script lang="ts">
    import { IconCaretRightFilled, IconTrash, IconUsers, IconUser, IconChevronRight, IconCode, IconPlus } from "@tabler/icons-svelte";
    import { Em, type EmSet } from "../../../_lib/types/EnemySet";
    import BoolInput from "../../../assets/BoolInput.svelte";
    import TextInput from "../../../assets/TextInput.svelte";
    import NumberInput from "../../../assets/NumberInput.svelte";
    import { slide } from "svelte/transition";
    import { cubicInOut } from "svelte/easing";
    import { createEventDispatcher } from "svelte";
    import '../tabs.css';
    import { questLookup } from "../../../_lib/lookupTable";
    import { currentEm, currentTab, currentTask, session } from "../../../store";
    
    export let set: EmSet;

    let expanded = false;

    const dispatch = createEventDispatcher();

    function confirmDelete() {
        if (confirm(`Are you sure you want to delete Task ${set.name}? This cannot be undone.`)) {
            dispatch("delete", set);
        }
    }

    let elem: HTMLDivElement;
    let shouldScroll = true;

    const scroll = () => {
        if (elem && shouldScroll) {
            elem.scrollIntoView({ block: "center", behavior: "smooth" });
            // when translating, scrollToView doesn't bring the screen to the right offset.
            // force it to scroll again after a delay.
            setTimeout(() => elem?.scrollIntoView({ block: "center" }), 1000);
        }
    }

    function focusEm(em: Em) {
        if ($currentEm === em) {
            $currentEm = null;
            return;
        }
        // only scroll the list if the em is being selected from the map.
        shouldScroll = false;
        $currentEm = em;
        setTimeout(() => shouldScroll = true, 100);
    }

    function referencedTasks() {
        let references: [string, number][] = []
        for (let i = 0; i < ($session?.questData.tasks.length || 0); i++) {
            let task = $session?.questData.tasks[i];
            for (let lineList of (task?.lineLists || [])) {
                for (let command of lineList) {
                    let ifArg = Object.keys(command.IFArgs).find(x => x.endsWith("GroupNo"));
                    let execArg = Object.keys(command.EXECArgs).find(x => x.endsWith("GroupNo"));
                    if (ifArg && command.IFArgs[ifArg] == set.number.toString()) {
                        references.push([task?.name || "Task", i]);
                        break;
                    } else if (execArg && command.EXECArgs[execArg] == set.number.toString()) {
                        references.push([task?.name || "Task", i]);
                        break;
                    }
                }
                if (references.length > 0 && references[references.length - 1][1] === i) break;
            }
        }
        return references;
    }
    let references = referencedTasks();

    $: if ($currentEm && set.ems.includes($currentEm)) setTimeout(() => scroll(), 0);
</script>

<div class="emSets" bind:this={elem}>
    <header>
        <button class="expand" class:active={expanded} on:click={() => expanded = !expanded}>
            <IconCaretRightFilled />
        </button>
        <span class="iconNumber">
            {set.number}
            <IconUsers color={`hsl(${set.number * 10}, 50%, 70%)`} />
        </span>
        <div class="text">
            <h3 translate="yes">{set.name}</h3>
        </div>
    </header>
    <div class="ems">
        {#each set.ems as em}
            <button class="em" class:active={$currentEm == em} on:click={focusEm.bind(null, em)}>
                <IconUser />
                <span>{questLookup(em.Id)}</span>
                <IconChevronRight />
            </button>
        {/each}
        <button class="addBtn addEm" on:click={() => { set.ems = [...set.ems, new Em(set.ems.length, [0x20000, 0x20000])]; focusEm(set.ems[set.ems.length - 1])}}>
            <IconPlus />
            Add Enemy
        </button>
    </div>
    <div class="referencedTasks">
        {#each references as reference}
            <button class="referencedTask" on:click={() => { $currentTask = reference[1]; $currentTab = "tasks"}}>
                <IconCode />
                <span translate="yes">{reference[0]}</span>
            </button>
        {/each}
    </div>
    {#if expanded}
    <div class="content" transition:slide={{axis: 'y', duration: 100, easing: cubicInOut}}>
        <NumberInput
            label="Set Number"
            description={"Must be exclusive."}
            bind:value={set.number}
        />
        <TextInput
            label="Name"
            bind:value={set.name}
        />
        <BoolInput
            label="Can set"
            description="Unknown purpose."
            bind:value={set.CanSet}
        />
        <h2 class="sectionHeader" style="padding-left: 10px">Difficulties (unknown purpose, usually blank)</h2>
        <TextInput
            label="Easy"
            bind:value={set.easy}
        />
        <TextInput
            label="Normal"
            bind:value={set.normal}
        />
        <TextInput
            label="Hard"
            bind:value={set.hard}
        />
        <TextInput
            label="Very Hard"
            bind:value={set.very_hard}
        />
        <button class="deleteBtn" on:click={confirmDelete}>
            <IconTrash />
            Delete set
        </button>
    </div>
    {/if}
</div>

<style>
    .iconNumber {
        display: flex;
        align-items: center;
        font-size: 20px;
        gap: 5px;
        font-weight: bold;
    }
    .content {
        border-top: 1px solid #333;
    }
    .emSets {
        width: calc(100% - 10px);
        background-color: #444;
        margin: 5px;
        border-radius: 10px;
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
    .em, .addEm {
        width: calc(100% - 20px);
        padding: 5px;
        margin: 5px 10px;
    }
    .em {
        background-color: #333;
        background: linear-gradient(90deg, #333 50%, #555 100%, #555) #333;
        background-repeat: no-repeat;
        background-position-x: 500px;
        transition: background-position 0.1s ease-in-out, background-color 0.1s ease-in-out;
    }
    .em:hover:not(.active) {
        background-position-x: 0;
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
    button.em span {
        flex-grow: 1;
        text-align: left;
    }
    button.em.active {
        background-color: #888;
    }
    button.deleteBtn {
        border-radius: 0 0 10px 10px;
    }
</style>