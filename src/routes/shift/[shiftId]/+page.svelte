<script lang="ts">
	import Form from '../../../features/shift-entry/Form.svelte';
	import type { DraftState } from '../../../features/shift-entry/api';
	let { data }: { data: { shiftId: string; draft: DraftState } } = $props();
</script>

<svelte:head><title>Input Shift | PomKita</title></svelte:head>
<section class="page" aria-labelledby="entry-title">
	<header class="page-header"><a href="/shift">← Kembali ke shift</a><h1 id="entry-title">Input Shift</h1><p>Catat pembacaan meter, penjualan, dan loss/gain untuk shift ini.</p></header>
	<Form shiftId={data.shiftId} draft={data.draft} />
</section>

<style>
	.page { display: grid; gap: var(--space-5); }
	.page-header { display: grid; gap: var(--space-2); }
	.page-header h1, .page-header p { margin: 0; }
	.page-header a { width: fit-content; color: var(--color-primary); font-size: .85rem; font-weight: 700; text-decoration: none; }
	.page-header p { color: var(--color-text-muted); }
</style>
