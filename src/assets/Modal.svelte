<script>
    import { createEventDispatcher } from "svelte";
    import { fade, fly } from "svelte/transition";
    import { cubicInOut } from "svelte/easing";

    const dispatch = createEventDispatcher();

    export let close = () => dispatch("close");
    export let style = "";
</script>
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="modal" on:click={close} transition:fade={{duration: 200, easing: cubicInOut}}>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="modalContent" style={style} on:click={(e) => e.stopPropagation()} transition:fly={{duration: 200, y: -100, easing: cubicInOut}}>
        <slot />
    </div>
</div>