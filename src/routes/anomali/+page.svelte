<script lang="ts">
	import AnomalyList from '../../features/anomaly/AnomalyList.svelte';
	import type { Anomaly } from '../../features/anomaly/api';

	let { data }: { data: { anomalies: Anomaly[] } } = $props();
</script>

<svelte:head><title>Anomali | PomKita</title></svelte:head>
<section class="page" aria-labelledby="anomaly-title">
	<header><p class="overline">Pemantauan</p><h1 id="anomaly-title">Anomali</h1><p>Kejadian yang perlu ditinjau dari aturan pengawasan.</p></header>
	<AnomalyList anomalies={data.anomalies} />
</section>

<style>
	header { display: grid; gap: var(--space-2); }
	h1, p { margin: 0; }
	h1 { font-size: 2rem; }
	header p:last-child { color: var(--color-text-muted); }
</style>
