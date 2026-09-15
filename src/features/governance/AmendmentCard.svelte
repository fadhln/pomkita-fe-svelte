<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { ApiError } from '$lib/api/client';
	import type { Session } from '$lib/session/api';
	import { approveAmendment, rejectAmendment, type AmendmentQueueEntry } from './api';
	import { formatAmendmentValue, formatGovernanceDate } from './format';

	let { amendment, session, onChanged }: { amendment: AmendmentQueueEntry; session: Session; onChanged?: () => void } = $props();
	let rejecting = $state(false);
	let rejectionReason = $state('');
	let validationError = $state('');
	let requestError = $state('');
	let success = $state('');
	let pending = $state(false);
	let requesterIsActor = $derived(session.user_id === amendment.Requester.UserID);

	function errorText(error: unknown) {
		if (error instanceof ApiError) return error.body.problem.detail ?? 'Permintaan tidak dapat diproses.';
		return 'Permintaan tidak dapat diproses.';
	}

	function statusLabel(value: string) {
		return value === 'pending' ? 'Menunggu' : value;
	}

	function fieldLabel(value: string) {
		return { cash_amount: 'Tunai', cashless_amount: 'Non-tunai', liters: 'Liter', note: 'Catatan' }[value] ?? value;
	}

	async function approve() {
		pending = true;
		requestError = '';
		try {
			await approveAmendment({ amendmentId: amendment.AmendmentID, stationId: amendment.StationID, staleCheckHash: amendment.StaleCheckHash });
			await invalidateAll();
			success = 'Amendemen disetujui.';
			onChanged?.();
		} catch (error) {
			requestError = errorText(error);
		} finally {
			pending = false;
		}
	}

	async function reject() {
		validationError = '';
		if (!rejectionReason.trim()) {
			validationError = 'Alasan penolakan wajib diisi.';
			return;
		}
		pending = true;
		requestError = '';
		try {
			await rejectAmendment({ amendmentId: amendment.AmendmentID, stationId: amendment.StationID, rejectionReason });
			await invalidateAll();
			success = 'Amendemen ditolak.';
			onChanged?.();
		} catch (error) {
			requestError = errorText(error);
		} finally {
			pending = false;
		}
	}
</script>

<article class="card" aria-labelledby={`amendment-${amendment.AmendmentID}`}>
	<header class="card-header">
		<div>
			<p class="eyebrow">Amendemen</p>
			<h2 id={`amendment-${amendment.AmendmentID}`}>Laporan versi {amendment.BaseVersionNo}</h2>
		</div>
		<span class="badge">{statusLabel(amendment.Status)}</span>
	</header>
	<dl class="meta">
		<div><dt>Pemohon</dt><dd>{amendment.Requester.DisplayName}</dd></div>
		<div><dt>Diminta</dt><dd>{formatGovernanceDate(amendment.RequestedAt)} UTC</dd></div>
		<div><dt>Alasan</dt><dd>{amendment.Reason}</dd></div>
	</dl>
	<p class="ids">Shift {amendment.ShiftID} · Laporan {amendment.BaseReportID}</p>
	<section aria-labelledby={`changes-${amendment.AmendmentID}`}>
		<h3 id={`changes-${amendment.AmendmentID}`}>Perubahan</h3>
		<ul>{#each amendment.Items as item}
			<li><strong>{fieldLabel(item.Field)}</strong><span>{formatAmendmentValue(item.OldValue, item.Field)} → {formatAmendmentValue(item.NewValue, item.Field)}</span></li>
		{/each}</ul>
	</section>
	{#if requesterIsActor}<p class="sod" role="note">Pemohon tidak dapat menjadi penyetuju.</p>{/if}
	{#if requestError}<p class="error" role="alert">{requestError}</p>{/if}
	{#if success}<p class="success" role="status">{success}</p>{/if}
	{#if rejecting}
		<label for={`reason-${amendment.AmendmentID}`}>Alasan penolakan <span>(wajib)</span></label>
		<textarea id={`reason-${amendment.AmendmentID}`} required bind:value={rejectionReason} aria-describedby={validationError ? `error-${amendment.AmendmentID}` : undefined}></textarea>
		{#if validationError}<p id={`error-${amendment.AmendmentID}`} class="error" role="alert">{validationError}</p>{/if}
	{/if}
	<footer class="actions">
		<button type="button" class="secondary" disabled={pending || requesterIsActor} onclick={() => (rejecting = true)}>Tolak</button>
		{#if rejecting}<button type="button" class="danger" disabled={pending || requesterIsActor} onclick={reject}>Kirim penolakan</button>{:else}<button type="button" disabled={pending || requesterIsActor} onclick={approve}>Setujui</button>{/if}
	</footer>
</article>

<style>
	.card { display: grid; gap: var(--space-4); padding: var(--space-5); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); box-shadow: var(--shadow-soft); }
	.card-header, .actions, li { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); }
	.card-header h2, h3, p, dl { margin: 0; }
	.eyebrow { color: var(--color-primary); font-size: .72rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
	h2 { font-size: 1.05rem; }
	h3 { font-size: .9rem; }
	.badge { padding: .3rem .65rem; border-radius: 99rem; background: var(--color-warning); color: white; font-size: .78rem; font-weight: 700; }
	.meta { display: grid; gap: var(--space-3); grid-template-columns: repeat(3, minmax(0, 1fr)); }
	dt { color: var(--color-text-muted); font-size: .75rem; }
	dd { margin: .15rem 0 0; font-weight: 650; }
	.ids { color: var(--color-text-muted); font-size: .75rem; overflow-wrap: anywhere; }
	ul { display: grid; gap: var(--space-2); margin: 0; padding: 0; list-style: none; }
	li { align-items: start; padding: var(--space-3); background: var(--color-page); border-radius: var(--radius-sm); }
	li span { text-align: right; font-variant-numeric: var(--font-variant-numeric); }
	.sod { padding: var(--space-3); background: #fff8e8; color: #805b00; border-radius: var(--radius-sm); font-size: .85rem; font-weight: 700; }
	.error { color: var(--color-danger); font-size: .85rem; font-weight: 700; }
	.success { color: var(--color-success); font-size: .85rem; font-weight: 700; }
	label { display: grid; gap: var(--space-1); font-size: .8rem; font-weight: 700; }
	label span { color: var(--color-danger); }
	textarea { min-height: 5rem; resize: vertical; }
	.danger { border-color: var(--color-danger); background: var(--color-danger); }
	@media (max-width: 42rem) { .meta { grid-template-columns: 1fr; } li { display: grid; } li span { text-align: left; } }
</style>
