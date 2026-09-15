<script lang="ts">
	import type { Session } from '$lib/session/api';
	import type { ShiftListItem } from '../shift-entry/api';
	import AckReview from './AckReview.svelte';

	type AckShift = ShiftListItem & { current_report_id: string };
	let { shifts, session }: { shifts: AckShift[]; session: Session } = $props();
	let selected = $state<AckShift>();
</script>

<section class="section" aria-labelledby="ack-title">
	<header><p class="eyebrow">Pemeriksaan</p><h2 id="ack-title">Konfirmasi laporan</h2><p>Periksa laporan yang menunggu keputusan akhir.</p></header>
	{#if selected}<AckReview shift={selected} stationId={selected.station_id} {session} onBack={() => (selected = undefined)} />{:else if shifts.length === 0}
		<div class="empty" role="status"><strong>Tidak ada laporan menunggu konfirmasi.</strong><span>Laporan baru muncul setelah shift dikirim.</span></div>
	{:else}<div class="list">{#each shifts as shift (shift.shift_id)}<article><div><strong>Shift #{shift.station_seq}</strong><span>{shift.business_date}</span></div><span class="badge">Menunggu konfirmasi</span><button type="button" onclick={() => (selected = shift)}>Lihat laporan</button></article>{/each}</div>{/if}
</section>

<style>
	.section { display: grid; gap: var(--space-5); }
	header { display: grid; gap: var(--space-2); }
	h2, p { margin: 0; }
	h2 { font-size: 1.25rem; }
	.eyebrow { color: var(--color-primary); font-size: .72rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
	header p:last-child { color: var(--color-text-muted); }
	.empty { display: grid; gap: var(--space-2); justify-items: center; padding: var(--space-8); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); text-align: center; }
	.empty span, article div span { color: var(--color-text-muted); font-size: .85rem; }
	.list { display: grid; gap: var(--space-3); }
	article { display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: var(--space-4); padding: var(--space-4); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
	article div { display: grid; gap: .15rem; }
	.badge { padding: .3rem .65rem; border-radius: 99rem; background: #fff8e8; color: var(--color-warning); font-size: .78rem; font-weight: 700; }
	@media (max-width: 42rem) { article { grid-template-columns: 1fr auto; } article button { grid-column: 1 / -1; } }
</style>
