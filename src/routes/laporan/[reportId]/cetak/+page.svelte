<script lang="ts">
	import ReportSummary from '../../../../features/report/ReportSummary.svelte';
	import ReportTables from '../../../../features/report/ReportTables.svelte';
	let { data }: { data: { report: import('../../../../features/report/api').ReportView } } = $props();
	function print() { globalThis.print?.(); }
</script>

<svelte:head><title>Cetak laporan | PomKita</title></svelte:head>
<section class="page" aria-labelledby="print-title"><header><a href={`/laporan/${data.report.report_id}`}>← Kembali ke detail</a><h1 id="print-title">Tampilan cetak laporan</h1><button type="button" onclick={print}>Cetak</button></header><ReportSummary report={data.report} /><ReportTables report={data.report} /></section>

<style>
	.page { display: grid; gap: var(--space-5); } header { display: flex; align-items: center; gap: var(--space-4); flex-wrap: wrap; } h1 { flex: 1 1 auto; margin: 0; font-size: 1.6rem; } a { color: var(--color-primary); font-weight: 700; text-decoration: none; } @media print { :global(.sidebar), :global(.topbar), button, header a { display: none !important; } :global(.main-area) { margin: 0; } }
</style>
