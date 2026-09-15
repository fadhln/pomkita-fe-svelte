<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { ApiError } from '$lib/api/client';
	import { claimDraft, heartbeatDraft, submitShift, uploadDraftEvidence, writeDraftLoss, writeDraftReading, writeDraftSales, type DraftLoss, type DraftState } from './api';
	import { isDraftConflict, validateLossRow } from './format';
	import ReadingRow from './ReadingRow.svelte';
	import SalesRow from './SalesRow.svelte';
	import LossRow from './LossRow.svelte';

	let { shiftId, draft: initialDraft }: { shiftId: string; draft: DraftState } = $props();
	function copyDraft(value: DraftState): DraftState { return { ...value, readings: [...value.readings], sales: [...value.sales], losses: [...value.losses], evidence: value.evidence ? [...value.evidence] : undefined }; }
	function initialValues() { return { draft: copyDraft(initialDraft), revision: initialDraft.revision }; }
	const initial = initialValues();
	const draftSeed = initial.draft;
	const revisionSeed = initial.revision;
	let draft = $state(draftSeed);
	let claimToken = $state<string>();
	let revision = $state(revisionSeed);
	let claimPending = $state(false);
	let heartbeatPending = $state(false);
	let conflict = $state(false);
	let submitOpen = $state(false);
	let submitFailed = $state(false);
	let awaitingConfirmation = $state(false);
	let error = $state('');
	let nozzles = $derived(draft.nozzles ?? draft.readings.map((reading) => ({ nozzle_id: reading.nozzle_id, meter_max: '' })));
	let dispensers = $derived(draft.dispensers ?? []);
	let requiredEvidenceMissing = $derived(draft.evidence_mode === 'wajib' && draft.losses.some((loss) => !draft.evidence?.some((item) => item.loss_row_id === loss.row_id)));

	function id() { return globalThis.crypto?.randomUUID?.() ?? `shift-${Date.now()}-${Math.random().toString(36).slice(2)}`; }
	async function claim() {
		if (!draft.draft_id) { error = 'Draft shift belum tersedia.'; return; }
		claimPending = true;
		try { const result = await claimDraft({ station_id: draft.station_id, shift_id: shiftId, draft_id: draft.draft_id }); claimToken = result.claim_token; revision = result.revision; }
		catch { error = 'Klaim draft tidak dapat dilakukan.'; }
		finally { claimPending = false; }
	}
	$effect(() => { if (draft.status === 'editing' && !claimToken && !claimPending) void claim(); });

	async function saveReading(nozzleId: string, value: { meter_start: string; meter_end: string }) {
		if (!claimToken) return;
		try { const result = await writeDraftReading({ station_id: draft.station_id, draft_id: draft.draft_id, claim_token: claimToken, revision, nozzle_id: nozzleId, ...value }); revision = result.revision; draft.readings = draft.readings.map((row) => row.nozzle_id === nozzleId ? { ...row, ...value } : row); await invalidateAll(); }
		catch (cause) { conflict = isDraftConflict(cause); error = cause instanceof ApiError && cause.status === 422 ? 'Periksa pembacaan meter.' : ''; }
	}
	async function saveSale(dispenserId: string, value: { cash_amount: string; cashless_amount: string }) {
		if (!claimToken) return;
		try { const result = await writeDraftSales({ station_id: draft.station_id, draft_id: draft.draft_id, claim_token: claimToken, revision, dispenser_id: dispenserId, ...value }); revision = result.revision; draft.sales = draft.sales.map((row) => row.dispenser_id === dispenserId ? { ...row, ...value } : row); await invalidateAll(); }
		catch (cause) { conflict = isDraftConflict(cause); }
	}
	async function saveLoss(loss: DraftLoss, value: { direction: 'loss' | 'gain'; reason_code: string; liters: string; cash_amount: string; note: string }) {
		if (Object.keys(validateLossRow(value)).length) { error = 'Periksa data loss dan gain.'; return; }
		if (!claimToken) return;
		try { const result = await writeDraftLoss({ station_id: draft.station_id, draft_id: draft.draft_id, claim_token: claimToken, revision, loss_id: loss.loss_id, ...value }); revision = result.revision; draft.losses = draft.losses.map((row) => row.loss_id === loss.loss_id ? { ...row, ...value } : row); await invalidateAll(); }
		catch (cause) { conflict = isDraftConflict(cause); }
	}
	async function upload(lossRowId: string, file: File) {
		if (!claimToken) return;
		const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
		const content_hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
		try { const result = await uploadDraftEvidence({ station_id: draft.station_id, draft_id: draft.draft_id, claim_token: claimToken, revision, loss_row_id: lossRowId, evidence_type: 'loss', object_key: `${id()}/${file.name}`, content_hash, size_bytes: file.size, mime: file.type }); revision = result.revision; draft.evidence = [...(draft.evidence ?? []), { loss_row_id: lossRowId, evidence_type: 'loss', object_key: file.name, content_hash, size_bytes: file.size, mime: file.type }]; await invalidateAll(); }
		catch (cause) { conflict = isDraftConflict(cause); error = 'Bukti tidak dapat diunggah.'; }
	}
	async function heartbeat() {
		if (!claimToken) return;
		heartbeatPending = true;
		try { await heartbeatDraft({ station_id: draft.station_id, draft_id: draft.draft_id, claim_token: claimToken }); await invalidateAll(); }
		finally { heartbeatPending = false; }
	}
	function addLoss() { draft.losses = [...draft.losses, { row_id: id(), loss_id: id(), direction: 'loss', reason_code: '', liters: '', cash_amount: null, note: null }]; }
	function submitInput() { return { station_id: draft.station_id, shift_id: draft.shift_id, draft_id: draft.draft_id, claim_token: claimToken ?? '', revision, payload: { hash_version: 1, readings: draft.readings.map(({ nozzle_id, meter_start, meter_end }) => ({ nozzle_id, meter_start, meter_end })), sales: draft.sales.map(({ dispenser_id, cash_amount, cashless_amount }) => ({ dispenser_id, cash_amount, cashless_amount })), losses: draft.losses.map(({ loss_id, direction, reason_code, liters, cash_amount, note }) => ({ loss_id, direction, reason_code, liters, cash_amount: cash_amount ?? '', note: note ?? '' })) } }; }
	async function submit() {
		submitFailed = false;
		try { await submitShift(submitInput(), id()); submitOpen = false; awaitingConfirmation = true; await invalidateAll(); }
		catch { submitOpen = false; submitFailed = true; }
	}
	function retrySubmit() { void submit(); }
</script>

{#if draft.status === 'submitted'}
	<div class="notice success" role="status"><strong>Shift sudah dikirim.</strong><span>Shift menunggu konfirmasi.</span></div>
{:else}
	<div class="entry" aria-busy={claimPending || heartbeatPending}>
		{#if conflict}<div class="notice danger" role="alert"><strong>Draft berubah di tab lain.</strong><button type="button" onclick={() => { conflict = false; void invalidateAll(); }}>Muat ulang</button></div>{/if}
		{#if error}<div class="notice danger" role="alert">{error}</div>{/if}
		{#if submitFailed}<div class="notice danger" role="alert"><strong>Pengiriman shift gagal.</strong><button type="button" onclick={retrySubmit}>Coba kirim lagi</button></div>{/if}
		{#if awaitingConfirmation}<div class="notice success" role="status"><strong>Menunggu konfirmasi</strong><span>Shift sudah dikirim dan menunggu konfirmasi.</span></div>{/if}
		<div class="toolbar"><span class="badge">{claimToken ? 'Klaim draft aktif' : 'Mengklaim draft'}</span>{#if claimToken}<button type="button" class="secondary" disabled={heartbeatPending} onclick={heartbeat}>Perbarui klaim</button>{/if}<button type="button" disabled={!claimToken || heartbeatPending || requiredEvidenceMissing || awaitingConfirmation} onclick={() => (submitOpen = true)}>Kirim shift</button></div>
		<section class="panel"><h2>Pembacaan meter nozzle</h2>{#if nozzles.length}<div class="grid">{#each nozzles as nozzle}<ReadingRow {nozzle} reading={draft.readings.find((row) => row.nozzle_id === nozzle.nozzle_id)} onSave={(value) => saveReading(nozzle.nozzle_id, value)} />{/each}</div>{:else}<p>Belum ada pembacaan nozzle.</p>{/if}</section>
		<section class="panel"><h2>Penjualan per dispenser</h2>{#if dispensers.length}<div class="grid">{#each dispensers as dispenser}<SalesRow {dispenser} sale={draft.sales.find((row) => row.dispenser_id === dispenser.dispenser_id)} onSave={(value) => saveSale(dispenser.dispenser_id, value)} />{/each}</div>{:else}<p>Belum ada pembacaan nozzle.</p>{/if}</section>
		<section class="panel"><header class="section-title"><h2>Loss dan gain</h2><button type="button" class="secondary" onclick={addLoss}>Tambah loss/gain</button></header>{#if draft.losses.length}{#each draft.losses as loss}<LossRow {loss} reasonCodes={draft.reason_codes} evidenceMode={draft.evidence_mode} evidence={draft.evidence} onSave={(value) => saveLoss(loss, value)} onUpload={(file) => upload(loss.row_id, file)} />{/each}{:else}<p>Belum ada loss atau gain.</p>{/if}</section>
	</div>
{/if}

{#if submitOpen}<div class="dialog-backdrop"><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="submit-title"><h2 id="submit-title">Konfirmasi kirim shift</h2><p>Periksa data sebelum mengirim shift.</p><div class="dialog-actions"><button type="button" class="secondary" onclick={() => (submitOpen = false)}>Batal</button><button type="button" onclick={submit}>Konfirmasi kirim</button></div></div></div>{/if}
