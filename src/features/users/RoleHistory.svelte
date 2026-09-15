<script lang="ts">
	import type { RoleHistoryEvent } from './api';
	let { events }: { events: RoleHistoryEvent[] } = $props();

	function valueText(value: unknown) {
		if (value === null || value === undefined || value === '') return '—';
		return typeof value === 'string' ? value : JSON.stringify(value);
	}

	function personText(value: unknown) {
		if (typeof value === 'string') return value;
		const person = value as { display_name?: string; username?: string; id?: string; user_id?: string } | null;
		return person?.display_name ?? person?.username ?? person?.id ?? person?.user_id ?? valueText(value);
	}
</script>

<section class="panel" aria-labelledby="role-history-title">
	<h2 id="role-history-title">Riwayat peran</h2>
	{#if events.length}
		<div class="table-wrap"><table><thead><tr><th>Urutan</th><th>Aktor</th><th>Target</th><th>Stasiun</th><th>Peran</th><th>Sebelum</th><th>Sesudah</th><th>Waktu</th></tr></thead>
			<tbody>{#each events as event (event.sequence)}<tr><td>{event.sequence}</td><td>{personText(event.actor)}</td><td>{personText(event.target)}</td><td>{event.station ?? event.station_id ?? '—'}</td><td>{event.role}</td><td>{valueText(event.before)}</td><td>{valueText(event.after)}</td><td>{event.created_at}</td></tr>{/each}</tbody>
		</table></div>
	{:else}<p class="empty">Belum ada perubahan peran.</p>{/if}
</section>

<style>
	.panel { display: grid; gap: var(--space-3); padding: var(--space-4); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
	h2, p { margin: 0; } h2 { font-size: 1.05rem; } .empty { color: var(--color-text-muted); }
	.table-wrap { overflow-x: auto; } table { width: 100%; min-width: 54rem; border-collapse: collapse; } th, td { padding: var(--space-2) var(--space-3); border-top: 1px solid var(--color-border); text-align: left; white-space: nowrap; } th { color: var(--color-text-muted); font-size: .72rem; text-transform: uppercase; }
</style>
