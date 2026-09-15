<script lang="ts">
	import { openBackfill, type BackfillInput } from './api';
	let { stationId, approverId }: { stationId: string; approverId: string } = $props();
	let eventDate = $state(''); let shiftKe = $state('1'); let reason = $state(''); let pending = $state(false); let error = $state(''); let opened = $state<string>();
	async function submit() {
		if (!eventDate || !reason.trim() || !stationId || !approverId) return;
		pending = true; error = '';
		const input: BackfillInput = { station_id: stationId, opened_at: new Date().toISOString(), backfilled: true, original_event_date: eventDate, shift_ke: Number(shiftKe), backfill_approver: approverId, backfill_reason: reason.trim() };
		try { opened = (await openBackfill(input)).shift_id; } catch { error = 'Backfill tidak dapat dibuka.'; } finally { pending = false; }
	}
</script>

{#if opened}<section class="panel" aria-labelledby="opened-title"><h2 id="opened-title">Backfill sudah dibuka</h2><p>Endpoint kontrak membuka shift backfill. Lanjutkan input melalui alur shift.</p><a href={`/shift/${opened}`}>Lanjut ke input shift</a></section>{:else}<form class="panel" onsubmit={(event) => { event.preventDefault(); void submit(); }}><h2>Backfill shift</h2><p>Backfill memakai <code>POST /shifts</code> dengan penanda dan alasan persetujuan.</p>{#if error}<p class="error" role="alert">{error}</p>{/if}<label>Tanggal kejadian asli<input type="date" bind:value={eventDate} required /></label><label>Nomor shift<input inputmode="numeric" bind:value={shiftKe} required /></label><label>Alasan backfill<textarea bind:value={reason} required></textarea></label><button type="submit" disabled={pending || !stationId || !approverId}>{pending ? 'Membuka…' : 'Setujui dan buka backfill'}</button></form>{/if}

<style>
	.panel { display: grid; gap: var(--space-4); padding: var(--space-5); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); } h2, p { margin: 0; } p { color: var(--color-text-muted); } label { display: grid; gap: .35rem; font-size: .8rem; font-weight: 700; } input, textarea { width: 100%; min-height: 2.5rem; padding: .45rem .65rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); } textarea { min-height: 5rem; } button, a { width: fit-content; } a { color: var(--color-primary); font-weight: 700; text-decoration: none; } .error { color: var(--color-danger); font-weight: 700; }
</style>
