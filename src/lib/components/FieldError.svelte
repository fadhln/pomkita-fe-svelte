<script lang="ts">
	let { message, id }: { message?: string; id?: string } = $props();
</script>

{#if message}<p {id} class="field-error">{message}</p>{/if}

<style>
	.field-error { margin: 0; color: var(--color-danger); font-size: .85rem; font-weight: 600; }
</style>
