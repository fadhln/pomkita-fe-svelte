<script lang="ts">
	import type { Anomaly } from './api';
	import { anomalyLabel, formatAnomalyDate } from './format';

	let { anomalies }: { anomalies: Anomaly[] } = $props();
</script>

{#if anomalies.length === 0}
	<div class="empty" role="status"><strong>Belum ada anomali.</strong><span>Anomali akan tampil saat aturan mendeteksi kejadian.</span></div>
{:else}
	<div class="table-wrap">
		<table>
			<caption>Daftar kejadian anomali</caption>
			<thead><tr><th>Jenis kejadian</th><th>Aturan</th><th>Sumber</th><th>Subjek</th><th>Versi</th><th>Waktu (UTC)</th></tr></thead>
			<tbody>{#each anomalies as anomaly (anomaly.event_id)}
				<tr><td><strong>{anomalyLabel(anomaly.event_type)}</strong></td><td>{anomaly.rule_id}</td><td>{anomalyLabel(anomaly.source_kind)}<br /><small>{anomaly.source_id}</small></td><td>{anomalyLabel(anomaly.subject_kind)}<br /><small>{anomaly.subject_id}</small></td><td>{anomaly.source_version_no ?? '—'}</td><td>{formatAnomalyDate(anomaly.happened_at)}</td></tr>
			{/each}</tbody>
		</table>
	</div>
{/if}

<style>
	.table-wrap { overflow-x: auto; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); box-shadow: var(--shadow-soft); }
	table { width: 100%; border-collapse: collapse; min-width: 48rem; }
	caption { padding: var(--space-4); text-align: left; font-weight: 750; }
	th, td { padding: var(--space-3) var(--space-4); border-top: 1px solid var(--color-border); text-align: left; vertical-align: top; }
	th { color: var(--color-text-muted); font-size: .75rem; text-transform: uppercase; letter-spacing: .04em; }
	td { font-size: .85rem; }
	small { color: var(--color-text-muted); font-size: .75rem; overflow-wrap: anywhere; }
	.empty { display: grid; gap: var(--space-2); justify-items: center; padding: var(--space-8); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); text-align: center; }
	.empty span { color: var(--color-text-muted); font-size: .85rem; }
</style>
