<script lang="ts">
	import ReportSummary from '../../../features/report/ReportSummary.svelte';
	import ReportTables from '../../../features/report/ReportTables.svelte';
	let { data }: { data: { report: import('../../../features/report/api').ReportView; shift: import('../../../features/shift-entry/api').ShiftDetail } } = $props();
</script>

<svelte:head><title>Detail laporan | PomKita</title></svelte:head>
<section class="page" aria-labelledby="detail-title"><header><a href="/laporan">← Kembali ke laporan</a><p class="overline">Snapshot laporan</p><h1 id="detail-title">Detail laporan</h1><p>Laporan bersifat tetap setelah dikirim.</p></header><ReportSummary report={data.report} shift={data.shift} /><ReportTables report={data.report} /><a class="print" href={`/laporan/${data.report.report_id}/cetak`}>Cetak laporan</a></section>

<style>
	.page { display: grid; gap: var(--space-5); } header { display: grid; gap: var(--space-2); } h1, header p { margin: 0; } h1 { font-size: 2rem; } header a, .print { color: var(--color-primary); font-weight: 700; text-decoration: none; } .overline { color: var(--color-primary); font-size: .72rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; } header p:last-child { color: var(--color-text-muted); }
</style>
