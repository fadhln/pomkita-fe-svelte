<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { ApiError } from '$lib/api/client';
	import type { Session } from '$lib/session/api';
	import { acknowledgeReport, getReport, type ReportView } from './api';
	import { formatGovernanceDate } from './format';
import type { ShiftListItem } from '../shift-entry/api';

	type AckShift = ShiftListItem & { current_report_id: string };
	let { shift, stationId, session, onBack }: { shift: AckShift; stationId: string; session: Session; onBack: () => void } = $props();
	let report = $state<ReportView>();
	let loading = $state(true);
	let pending = $state(false);
	let rejecting = $state(false);
	let breakGlass = $state(false);
	let rejectionReason = $state('');
	let breakGlassReason = $state('');
	let validationError = $state('');
	let requestError = $state('');
	let success = $state('');
	let canBreakGlass = $derived((session.roles ?? []).some((role) => ['owner', 'superadmin'].includes(role.toLowerCase())));

	function errorText(error: unknown) {
		if (error instanceof ApiError) return error.body.problem.detail ?? 'Permintaan tidak dapat diproses.';
		return 'Permintaan tidak dapat diproses.';
	}

	$effect(() => {
		void getReport(shift.current_report_id, stationId).then((value) => (report = value)).catch((error) => (requestError = errorText(error))).finally(() => (loading = false));
	});

	async function submit(decision: 'acked' | 'rejected') {
		validationError = '';
		if (decision === 'rejected' && !rejectionReason.trim()) {
			validationError = 'Alasan penolakan wajib diisi.';
			return;
		}
		if (decision === 'acked' && breakGlass && !breakGlassReason.trim()) {
			validationError = 'Alasan break-glass wajib diisi.';
			return;
		}
		if (!report) return;
		pending = true;
		requestError = '';
		try {
			await acknowledgeReport({ reportId: report.report_id, stationId, shiftId: shift.shift_id, versionNo: report.version_no, decision, rejectionReason: decision === 'rejected' ? rejectionReason : undefined, isBreakGlass: decision === 'acked' && breakGlass, breakGlassReason: decision === 'acked' && breakGlass ? breakGlassReason : undefined });
			await invalidateAll();
			success = decision === 'acked' ? 'Laporan disetujui.' : 'Laporan ditolak.';
		} catch (error) {
			requestError = errorText(error);
		} finally {
			pending = false;
		}
	}
</script>

<section class="review" aria-labelledby="review-title">
	<button type="button" class="back" onclick={onBack}>← Kembali ke antrean</button>
	{#if loading}<p role="status">Memuat laporan…</p>{:else if requestError && !report}<p class="error" role="alert">{requestError}</p>{:else if report}
		<header><p class="eyebrow">Konfirmasi laporan</p><h2 id="review-title">Shift #{shift.station_seq}</h2><p>Versi {report.version_no} · {formatGovernanceDate(report.submitted_at)} UTC</p></header>
		<div class="summary"><span>Status: {report.status}</span><span>{report.readings.length} pembacaan · {report.sales.length} penjualan · {report.losses.length} loss/gain</span></div>
		<p class="sod" role="note">Penyetuju harus berbeda dari pembuat laporan.</p>
		{#if requestError}<p class="error" role="alert">{requestError}</p>{/if}
		{#if success}<p class="success" role="status">{success}</p>{/if}
		{#if canBreakGlass}<label class="check"><input type="checkbox" bind:checked={breakGlass} /> Gunakan break-glass</label>{/if}
		{#if breakGlass}<label for="break-glass-reason">Alasan break-glass <span>(wajib)</span></label><textarea id="break-glass-reason" required bind:value={breakGlassReason}></textarea>{/if}
		{#if rejecting}<label for="rejection-reason">Alasan penolakan <span>(wajib)</span></label><textarea id="rejection-reason" required bind:value={rejectionReason}></textarea>{/if}
		{#if validationError}<p class="error" role="alert">{validationError}</p>{/if}
		<footer class="actions"><button type="button" class="secondary" disabled={pending} onclick={() => (rejecting = !rejecting)}>{rejecting ? 'Batal penolakan' : 'Tolak'}</button>{#if rejecting}<button type="button" class="danger" disabled={pending} onclick={() => submit('rejected')}>Kirim penolakan</button>{:else}<button type="button" disabled={pending} onclick={() => submit('acked')}>Setujui laporan</button>{/if}</footer>
	{/if}
</section>

<style>
	.review { display: grid; gap: var(--space-5); }
	.back { width: fit-content; border: 0; padding: 0; background: transparent; color: var(--color-primary); }
	header { display: grid; gap: var(--space-2); }
	h2, header p { margin: 0; }
	header p:last-child { color: var(--color-text-muted); }
	.eyebrow { color: var(--color-primary); font-size: .72rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
	.summary, .actions { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--space-3); }
	.summary { padding: var(--space-4); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
	.sod { padding: var(--space-3); background: #fff8e8; color: #805b00; border-radius: var(--radius-sm); font-size: .85rem; font-weight: 700; }
	.check, label { display: grid; gap: var(--space-2); font-size: .85rem; font-weight: 700; }
	.check { display: flex; align-items: center; }
	.check input { width: auto; min-height: auto; }
	label span { color: var(--color-danger); }
	textarea { min-height: 5rem; resize: vertical; }
	.error { color: var(--color-danger); font-size: .85rem; font-weight: 700; }
	.success { color: var(--color-success); font-size: .85rem; font-weight: 700; }
	.danger { border-color: var(--color-danger); background: var(--color-danger); }
</style>
