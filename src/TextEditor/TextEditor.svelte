<script lang="ts">
    import SideBarText from "./SideBarText.svelte";
    import { textCache } from "../store";
	import { tick } from "svelte";
	import SectionEditor from "./SectionEditor.svelte";

    let section = $textCache ? Object.keys($textCache.strings)[0] : null;

    let scrollToKey: ((key: string) => void) | undefined;
    async function scrollTo(newSection: string, key: string) {
        if (!$textCache) return;
        section = newSection;
        await tick();
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
        if (scrollToKey) (scrollToKey as (key: string) => void)(key);
    }
</script>
<SideBarText bind:section={section} scrollTo={scrollTo} />
{#if $textCache !== null && section !== null && $textCache.strings[section]}
    {#key section}
        <SectionEditor section={section} bind:scrollToIndex={scrollToKey} />
    {/key}
{/if}