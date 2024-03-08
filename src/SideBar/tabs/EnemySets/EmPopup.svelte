<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { questLookup } from "../../../_lib/lookupTable";
    import { Em } from "../../../_lib/types/EnemySet";
    import { fly } from "svelte/transition";
    import { cubicIn } from "svelte/easing";
    import { IconCopy, IconHash, IconInfoCircle, IconMessage, IconMessage2, IconQuestionMark, IconSettingsCode, IconTrash, IconX } from "@tabler/icons-svelte"
    import VectorInput from "../../../assets/VectorInput.svelte";
    import NumberInput from "../../../assets/NumberInput.svelte";
    import { currentTalkScript, currentTab, currentEm, session } from "../../../store";
    import BoolInput from "../../../assets/BoolInput.svelte";
    import RotationInput from "../../../assets/RotationInput.svelte";

    const dispatch = createEventDispatcher();

    export let em: Em;

    export let tab = "about";

    function deleteEm() {
        if (!$session) return;

        let set = $session.enemySet.sets.find(x => x.ems.includes(em));
        if (!set) return;

        set.ems = set.ems.filter(x => x != em);

        dispatch("close");
    }

    function duplicateEm() {
        if (!$session) return;

        let set = $session.enemySet.sets.find(x => x.ems.includes(em));
        if (!set) return;

        let copy = Em.fromNode(em.repack());
        copy.SetNo = set.ems.length;
        set.ems = [...set.ems, copy];

        $currentEm = copy;
    }

    $: referencedTalkScripts = $session?.talkScript ?
        $session.talkScript.scripts.filter(x =>
            x.triggerType !== 1 &&
            x.objId.toUpperCase() == questLookup(em.Id.toString(16), true)?.toUpperCase()&&
            x.setType == em.SetType
        ) : [];
</script>

<div class="emPopup" transition:fly|global={{x: -50, duration: 100, easing: cubicIn}}>
    <header>
        <div class="text">
            <h1 style="font-weight: bold">{questLookup(em.Id.toString(16))}</h1>
            <span style="color: #ccc">{questLookup(em.Id.toString(16), true)}</span>
        </div>
        {#if questLookup(em.Id.toString(16), true)}
        <img
            width="150"
            height="150"
            src={`./icons/${questLookup(em.Id.toString(16), true)}.png`}
            alt="Icon"
            on:error={(e) => e.target.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="}
        />
        {/if}
        <button class="transparentBtn" style="color: white" on:click={() => dispatch("close")}>
            <IconX />
        </button>
    </header>
    <div class="tabs">
        <button class="tab" class:active={tab === "about"} on:click={() => tab = "about"}><IconInfoCircle /></button>
        <button class="tab" class:active={tab === "numbers"} on:click={() => tab = "numbers"}><IconHash /></button>
        <button class="tab" class:active={tab === "setters"} on:click={() => tab = "setters"}><IconSettingsCode /></button>
        <button class="tab" class:active={tab === "extras"} on:click={() => tab = "extras"}><IconQuestionMark /></button>
    </div>
    <div class="content">
        {#if tab === "about"}
            <div class="quickActions">
                <button on:click={duplicateEm}>
                    <IconCopy />
                    Duplicate
                </button>
                <button class="deleteBtn" on:click={deleteEm}>
                    <IconTrash />
                    Delete
                </button>
            </div>
            {#if referencedTalkScripts.length}
                <h2 class="sectionHeader">TalkScripts initiated by this object</h2>
                <div class="talkScriptList">
                    {#each referencedTalkScripts as script}
                        <button class="talkScript" on:click={() => {$currentTab = "talkScripts"; $currentTalkScript = script}}>
                            {#if script.triggerType === 0}
                                <IconMessage />
                                <span>{script.questId} (interaction)</span>
                            {:else}
                                <IconMessage2 />
                                <span>{script.questId} (Speech bubble)</span>
                            {/if}
                        </button>
                    {/each}
                </div>
            {/if}
            <NumberInput
                label="GroupPos"
                bind:value={em.GroupPos}
            />
            <h2 class="sectionHeader">Primary Object - {questLookup(em.Id.toString(16))}</h2>
            <NumberInput
                label="Id"
                description={questLookup(em.Id.toString(16), true)}
                bind:value={em.Id}
            />
            <VectorInput
                label="Position"
                bind:value={em.Trans}
            />
            <RotationInput
                label="Rotation"
                bind:value={em.Rotation}
            />
            <VectorInput
                label="Base Rotation"
                bind:value={em.BaseRot}
            />
            <h2 class="sectionHeader">Secondary Object{em.secondaryObjectEnabled ? " - " + questLookup(em.IdL.toString(16)) : ""}</h2>
            <BoolInput
                label="Enable Secondary Object"
                bind:value={em.secondaryObjectEnabled}
            />
            {#if em.secondaryObjectEnabled}
                <NumberInput
                    label="Id"
                    description={questLookup(em.IdL.toString(16), true)}
                    bind:value={em.IdL}
                />
                <VectorInput
                    label="L Position"
                    bind:value={em.TransL}
                />
                <VectorInput
                    label="L Base Rotation"
                    bind:value={em.BaseRot}
                />
            {/if}
            <h2 class="sectionHeader">Temporary position</h2>
            <VectorInput
                label="Temp. pos"
                description="Unknown use."
                bind:value={em.TmpPos}
            />
        {:else if tab === "numbers"}
            <NumberInput
                label="SetNo"
                bind:value={em.SetNo}
            />
            <NumberInput
                label="SetType"
                description="Do not touch if this entity has a TalkScript!"
                bind:value={em.SetType}
            />
            <NumberInput
                label="PathNo"
                bind:value={em.PathNo}
            />
            <NumberInput
                label="EscapeNo"
                bind:value={em.EscapeNo}
            />
            <NumberInput
                label="NoticeNo"
                bind:value={em.NoticeNo}
            />
            <NumberInput
                label="LvMin"
                bind:value={em.LvMin}
            />
            <NumberInput
                label="LvMax"
                bind:value={em.LvMax}
            />
            <NumberInput
                label="ParentId"
                description={"0x" + em.ParentId.toString(16)}
                bind:value={em.ParentId}
            />
            <NumberInput
                label="PartsNo"
                bind:value={em.PartsNo}
            />
            <NumberInput
                label="HashNo"
                bind:value={em.HashNo}
            />
            <NumberInput
                label="ItemId"
                bind:value={em.ItemId}
            />
            <NumberInput
                label="GridDisp"
                bind:value={em.GridDisp}
            />
            <NumberInput
                label="EventSuspend"
                bind:value={em.EventSuspend}
            />
            <NumberInput
                label="SimpleSubspaceSuspend"
                bind:value={em.SimpleSubspaceSuspend}
            />
        {:else if tab === "setters"}
            <h2 class="sectionHeader">Other settings</h2>
            <NumberInput
                label="SetRtn"
                description={"0x" + em.SetRtn.toString(16)}
                bind:value={em.SetRtn}
            />
            <NumberInput
                label="SetFlag"
                description={"0x" + em.SetFlag.toString(16)}
                bind:value={em.SetFlag}
            />
            <NumberInput
                label="SetWait"
                bind:value={em.SetWait}
            />
            <NumberInput
                label="SetTimer"
                bind:value={em.SetTimer}
            />
            <NumberInput
                label="SetCounter"
                bind:value={em.SetCounter}
            />
            <NumberInput
                label="SetRadius"
                bind:value={em.SetRadius}
            />
        {:else if tab === "extras"}
            <NumberInput
                label="ExSetTypeA"
                description={"Width on bga050. 0x" + em.ExSetTypeA.toString(16)}
                bind:value={em.ExSetTypeA}
            />
            <NumberInput
                label="ExSetTypeB"
                description={"Height on bga050. 0x" + em.ExSetTypeB.toString(16)}
                bind:value={em.ExSetTypeB}
            />
            <NumberInput
                label="ExSetTypeC"
                description={"0x" + em.ExSetTypeC.toString(16)}
                bind:value={em.ExSetTypeC}
            />
            <NumberInput
                label="ExSetTypeC"
                description={"0x" + em.ExSetTypeD.toString(16)}
                bind:value={em.ExSetTypeD}
            />
            <NumberInput
                label="ExSetAttr"
                bind:value={em.ExSetAttr}
            />
            <NumberInput
                label="ExSetRtn"
                bind:value={em.ExSetRtn}
            />
            <NumberInput
                label="ExSetFlag"
                bind:value={em.ExSetFlag}
            />
        {/if}
    </div>
</div>

<style>
    .emPopup {
        position: fixed;
        top: 32px;
        left: 817px;
        border-radius: 10px;
        z-index: 3;
        background: #444;
        box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
        min-width: min(500px, max(200px, calc(100vw - 827px)));
        max-width: 500px;
        max-height: calc(100% - 64px);
    }
    header {
        background-color: var(--primary-900);
        border-radius: 10px 10px 0 0;
        height: 64px;
        position: relative;
    }
    header .text {
        position: absolute;
        left: 10px;
        z-index: 1;
        filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.5));
    }
    header button {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 1;
    }
    header img {
        position: absolute;
        right: 50px;
        top: -28px;
        clip-path: polygon(0 0, 100% 0, 100% 75%, 0 75%);
    }
    .tabs {
        width: 100%;
        display: flex;
        background-color: var(--primary-900);
        justify-content: stretch;
    }
    .tab {
        border-radius: 10px 10px 0 0;
        width: 100%;
        background-color: var(--primary-900);
    }
    .tab:hover {
        background-color: var(--primary-700);
    }
    .tab.active {
        background-color: #444;
    }
    .content {
        max-height: calc(100vh - 200px);
        overflow: auto;
    }
    .content .sectionHeader {
        margin-left: 10px;
    }
    .talkScriptList {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        width: calc(100% - 20px);
        margin: 10px;
    }
    .quickActions {
        display: flex;
        gap: 10px;
        width: calc(100% - 20px);
        padding: 10px;
    }
    .quickActions button {
        flex-grow: 1;
        width: 100%;
    }
</style>