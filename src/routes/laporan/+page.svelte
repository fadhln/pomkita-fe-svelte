<script lang="ts">
	let { data }: { data: { reports: import('../../features/report/api').ReportListItem[] } } = $props();
</script>

<svelte:head><title>Laporan | PomKita</title></svelte:head>
<section class="page" aria-labelledby="report-title">
	<header><p class="overline">Pelaporan</p><h1 id="report-title">Laporan</h1><p>Tinjau snapshot laporan yang tidak dapat diedit.</p></header>
	<section class="panel" aria-labelledby="list-title"><h2 id="list-title">Daftar laporan</h2>
		{#if data.reports.length}<div class="list">{#each data.reports as report (report.current_report_id)}<article><div><strong>Laporan {report.current_report_id}</strong><span>Shift #{report.station_seq} · {report.business_date}</span></div><span class="badge">{report.status}</span><a href={`/laporan/${report.current_report_id}`}>Lihat laporan</a></article>{/each}</div>{:else}<p class="empty">Belum ada laporan.</p>{/if}
	</section>
</section>

<style>
	header { display: grid; gap: var(--space-2); } h1, header p { margin: 0; } h1 { font-size: 2rem; } header p:last-child, .empty, article span { color: var(--color-text-muted); } .panel { display: grid; gap: var(--space-4); padding: var(--space-5); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); } h2 { margin: 0; font-size: 1.05rem; } .list { display: grid; gap: var(--space-3); } article { display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: var(--space-4); padding: var(--space-4); border: 1px solid var(--color-border); border-radius: var(--radius-sm); } article div { display: grid; gap: .15rem; } article span { font-size: .8rem; } .badge { padding: .3rem .65rem; border-radius: 99rem; background: var(--color-primary-soft); color: var(--color-primary) !important; font-weight: 700; } a { color: var(--color-primary); font-weight: 700; text-decoration: none; } @media (max-width: 42rem) { article { grid-template-columns: 1fr auto; } article a { grid-column: 1 / -1; } }
</style>
