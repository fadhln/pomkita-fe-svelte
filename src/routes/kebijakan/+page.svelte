<script lang="ts">
	import PolicyEditor from '../../features/policy/PolicyEditor.svelte';
	let { data }: { data: { revisions: import('../../features/policy/api').PolicyRevision[]; stationId: string } } = $props();
</script>

<svelte:head><title>Kebijakan | PomKita</title></svelte:head>
<section class="page" aria-labelledby="policy-title"><header><p class="overline">Kontrol</p><h1 id="policy-title">Kebijakan</h1><p>Tinjau dan buat revisi kebijakan operasional.</p></header><PolicyEditor revisions={data.revisions} stationId={data.stationId} /></section>

<style>
	.page { display: grid; gap: var(--space-6); } header { display: grid; gap: var(--space-2); } h1, header p { margin: 0; } h1 { font-size: 2rem; } .overline { color: var(--color-primary); font-size: .72rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; } header p:last-child { color: var(--color-text-muted); }
</style>
