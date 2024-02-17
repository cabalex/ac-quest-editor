<script lang="ts">
    import { IconLoader2 } from "@tabler/icons-svelte";

    export let text = "Loading...";
    export let style = "";
</script>

<div class="loading" style={style}>
    <IconLoader2 />
    {text}
</div>

<style>
    .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        gap: 10px;
    }
    :global(.loading svg) {
        animation: spin 2s linear infinite;
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
</style>