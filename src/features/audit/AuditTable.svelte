<script lang="ts">
	import { auditIdentity } from './api';
	import { auditLabel } from './format';
	import type { AuditRow } from './api';
	let { rows }: { rows: AuditRow[] } = $props();
</script>

{#if rows.length}<div class="table-wrap"><table><thead><tr><th>Urutan</th><th>Peristiwa</th><th>Stasiun</th><th>Aktor</th><th>Waktu</th><th>Hasil</th></tr></thead><tbody>{#each rows as row (row.event_id)}{@const identity = auditIdentity(row)}{@const label = auditLabel(row)}<tr><td>{label.sequence}</td><td>{row.event_type}</td><td>{identity.station_id || '—'}</td><td>{identity.actor_user_id || '—'}</td><td>{label.date}</td><td>{row.outcome}</td></tr>{/each}</tbody></table></div>{:else}<p class="empty">Belum ada audit untuk filter ini.</p>{/if}

<style>
	.table-wrap { overflow-x: auto; } table { width: 100%; border-collapse: collapse; font-variant-numeric: tabular-nums; } th, td { padding: .65rem; border-bottom: 1px solid var(--color-border); text-align: left; white-space: nowrap; } th { color: var(--color-text-muted); font-size: .75rem; } .empty { color: var(--color-text-muted); }
</style>
