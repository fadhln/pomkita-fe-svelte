<script lang="ts">
	import type { ReportView } from './api';
	let { report, shift }: { report: ReportView; shift?: { shift_id: string; station_seq: number; business_date: string; status: string } } = $props();
	const date = (value: string) => new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(value));
</script>

<section class="summary" aria-label="Ringkasan laporan">
	<div><span>Status</span><strong>{report.status}</strong></div><div><span>Versi</span><strong>{report.version_no}</strong></div><div><span>Dikirim</span><strong>{date(report.submitted_at)}</strong></div>
	{#if shift}<div><span>Shift</span><strong>#{shift.station_seq} · {shift.business_date}</strong></div>{/if}
</section>

<style>
	.summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr)); gap: var(--space-3); } .summary div { display: grid; gap: .2rem; padding: var(--space-4); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-sm); } span { color: var(--color-text-muted); font-size: .75rem; } strong { font-variant-numeric: tabular-nums; }
</style>
