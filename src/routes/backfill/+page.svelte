<script lang="ts">
	import BackfillForm from '../../features/backfill/BackfillForm.svelte';
	let { data }: { data: { stationId: string; approverId: string } } = $props();
</script>

<svelte:head><title>Backfill | PomKita</title></svelte:head>
<section class="page" aria-labelledby="backfill-title"><header><p class="overline">Pemulihan operasional</p><h1 id="backfill-title">Backfill shift</h1><p>Buka shift yang tertinggal dengan alasan dan penanda audit.</p></header><BackfillForm {...data} /></section>

<style>
	.page { display: grid; gap: var(--space-6); } header { display: grid; gap: var(--space-2); } h1, header p { margin: 0; } h1 { font-size: 2rem; } .overline { color: var(--color-primary); font-size: .72rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; } header p:last-child { color: var(--color-text-muted); }
</style>
