import { apiFetch } from '$lib/api/client';

export type ShiftStatus = string;
type Shift = { shift_id: string; org_id: string; station_id: string; station_seq: number; supervisor_id: string; opened_at: string; timezone_snapshot: string; business_date: string; status: ShiftStatus; price_map_hash?: string; price_map_snapshot?: string };
export type ShiftListItem = { shift_id: string; station_id: string; station_seq: number; supervisor_id: string; opened_at: string; business_date: string; status: ShiftStatus; current_report_id?: string };
export type ShiftDetail = ShiftListItem & { draft_id?: string; revision?: number };
export type DraftReading = { row_id: string; nozzle_id: string; meter_start: string; meter_end: string };
export type DraftSale = { row_id: string; dispenser_id: string; cash_amount: string; cashless_amount: string };
export type DraftLoss = { row_id: string; loss_id: string; direction: 'loss' | 'gain'; reason_code: string; liters: string; cash_amount: string | null; note: string | null };
export type DraftEvidence = { loss_row_id: string; evidence_type: string; object_key: string; content_hash: string; size_bytes: number; mime: string };
export type DraftState = { station_id: string; draft_id: string; shift_id: string; status: 'editing' | 'submitting' | 'submitted' | 'failed' | 'recovering'; revision: number; readings: DraftReading[]; sales: DraftSale[]; losses: DraftLoss[]; evidence?: DraftEvidence[]; reason_codes?: string[]; evidence_mode?: 'wajib' | 'opsional'; nozzles?: { nozzle_id: string; label?: string; meter_max: string }[]; dispensers?: { dispenser_id: string; label?: string }[] };
export type OpenShiftInput = { station_id: string; opened_at?: string; backfilled?: boolean; backfill_approver?: string; backfill_reason?: string; original_event_date?: string; shift_ke?: number };
export type RevisionResponse = { revision: number };
export type ClaimDraftInput = { station_id: string; shift_id: string; draft_id: string };
export type DraftIdentity = { station_id: string; draft_id: string; claim_token: string; revision: number };
export type SubmitInput = DraftIdentity & { shift_id: string; payload: unknown };
export type SubmitResult = { report_id: string; replay: boolean; request_hash?: string };

export function getShifts(stationId?: string) {
	const query = stationId ? `?station_id=${encodeURIComponent(stationId)}` : '';
	return apiFetch<ShiftListItem[] | null>(`/shifts${query}`);
}
export function getShiftDetail(shiftId: string, stationId?: string) {
	const query = stationId ? `?station_id=${encodeURIComponent(stationId)}` : '';
	return apiFetch<ShiftDetail>(`/shifts/${encodeURIComponent(shiftId)}${query}`);
}
export function draftFromShift(detail: ShiftDetail): DraftState {
	return { station_id: detail.station_id, draft_id: detail.draft_id ?? '', shift_id: detail.shift_id, status: 'editing', revision: detail.revision ?? 0, readings: [], sales: [], losses: [] };
}
export function openShift(input: OpenShiftInput) {
	const openedAt = input.opened_at ?? new Date().toISOString();
	const backfilled = input.backfilled ?? false;
	const body = { station_id: input.station_id, opened_at: openedAt, backfilled, backfill_approver: input.backfill_approver ?? null, backfill_reason: backfilled ? input.backfill_reason ?? '' : '', original_event_date: backfilled ? input.original_event_date ?? openedAt.slice(0, 10) : '', shift_ke: backfilled ? input.shift_ke ?? 0 : 0 };
	return apiFetch<Shift>('/shifts', { method: 'POST', body: JSON.stringify(body) });
}
export function claimDraft(input: ClaimDraftInput) { return apiFetch<{ draft_id: string; claim_token: string; claim_expires_at: string; revision: number }>('/drafts/claim', { method: 'POST', body: JSON.stringify(input) }); }
export function heartbeatDraft(input: Pick<DraftIdentity, 'station_id' | 'draft_id' | 'claim_token'>) { return apiFetch<void>('/drafts/heartbeat', { method: 'POST', body: JSON.stringify(input) }); }
export function writeDraftReading(input: DraftIdentity & { nozzle_id: string; meter_start: string; meter_end: string }) { return apiFetch<RevisionResponse>('/drafts/readings', { method: 'POST', body: JSON.stringify(input) }); }
export function writeDraftSales(input: DraftIdentity & { dispenser_id: string; cash_amount: string; cashless_amount: string }) { return apiFetch<RevisionResponse>('/drafts/sales', { method: 'POST', body: JSON.stringify(input) }); }
export function writeDraftLoss(input: DraftIdentity & { loss_id: string; direction: 'loss' | 'gain'; reason_code: string; liters: string; cash_amount: string; note: string }) { return apiFetch<RevisionResponse>('/drafts/losses', { method: 'POST', body: JSON.stringify(input) }); }
export function uploadDraftEvidence(input: DraftIdentity & { loss_row_id: string; evidence_type: string; object_key: string; content_hash: string; size_bytes: number; mime: string }) { return apiFetch<RevisionResponse>('/drafts/evidence', { method: 'POST', body: JSON.stringify(input) }); }
export function submitShift(input: SubmitInput, idempotencyKey: string) { return apiFetch<SubmitResult>('/submissions', { method: 'POST', headers: { 'Idempotency-Key': idempotencyKey }, body: JSON.stringify(input) }); }
