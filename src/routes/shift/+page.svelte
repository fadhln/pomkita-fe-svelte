<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { openShift, type ShiftListItem } from '../../features/shift-entry/api';

	let { data }: { data: { shifts: ShiftListItem[]; stationId: string } } = $props();
	let openedAt = $state('');
	let pending = $state(false);
	let error = $state('');

	function status(value: ShiftListItem['status']) {
		return value === 'open' ? 'Terbuka' : value === 'locked' ? 'Terkunci' : 'Diproses';
	}
	async function open() {
		pending = true;
		error = '';
		try {
			const input = openedAt ? { station_id: data.stationId, opened_at: new Date(openedAt).toISOString() } : { station_id: data.stationId };
			const result = await openShift(input);
			await invalidateAll();
			await goto(`/shift/${result.shift_id}`);
		} catch { error = 'Shift tidak dapat dibuka.'; }
		finally { pending = false; }
	}
</script>

<svelte:head><title>Shift | PomKita</title></svelte:head>
<section class="page" aria-labelledby="shift-title">
	<header class="page-header"><div><p class="overline">Operasional</p><h1 id="shift-title">Shift</h1><p>Kelola shift dan input laporan operasional.</p></div></header>
	<section class="panel" aria-labelledby="open-title"><h2 id="open-title">Buka shift</h2><label for="opened-at">Waktu buka (opsional)</label><input id="opened-at" type="datetime-local" bind:value={openedAt} /><button type="button" disabled={!data.stationId || pending} onclick={open}>Buka shift</button>{#if error}<p class="error" role="alert">{error}</p>{/if}</section>
	<section class="panel" aria-labelledby="list-title"><h2 id="list-title">Daftar shift</h2>{#if data.shifts.length}<div class="shift-list">{#each data.shifts as shift}<article class="shift-item"><div><strong>Shift #{shift.station_seq}</strong><span>{shift.business_date}</span></div><span class="badge">{status(shift.status)}</span><a href={`/shift/${shift.shift_id}`}>Input shift</a></article>{/each}</div>{:else}<p>Belum ada riwayat shift.</p>{/if}</section>
</section>

<style>
	.page-header p { margin: 0; color: var(--color-text-muted); }
	.overline { margin-bottom: var(--space-2) !important; }
	h1 { margin: 0 0 var(--space-2); font-size: 2rem; }
	.panel { display: grid; gap: var(--space-3); padding: var(--space-5); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); box-shadow: var(--shadow-soft); }
	h2 { margin: 0; font-size: 1.05rem; }
	.panel > input { max-width: 22rem; }
	.panel > button { width: fit-content; }
	.shift-list { display: grid; gap: var(--space-3); }
	.shift-item { display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: var(--space-4); padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-sm); }
	.shift-item div { display: grid; gap: .15rem; }
	.shift-item span:not(.badge) { color: var(--color-text-muted); font-size: .8rem; }
	.shift-item a { color: var(--color-primary); font-weight: 700; text-decoration: none; }
	.error { color: var(--color-danger) !important; font-size: .85rem; font-weight: 700; }
	@media (max-width: 40rem) { .shift-item { grid-template-columns: 1fr auto; } .shift-item a { grid-column: 1 / -1; } }
</style>
