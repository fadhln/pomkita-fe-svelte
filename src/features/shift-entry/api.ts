import { apiFetch } from '$lib/api/client';

export type ShiftStatus = 'open' | 'submitting' | 'failed' | 'abandoned' | 'awaiting_confirmation' | 'needs_correction' | 'locked';
export type ShiftListItem = { shift_id: string; station_id: string; station_seq: string; business_date: string; status: ShiftStatus; current_report_id: string | null };
export type DraftReading = { row_id: string; nozzle_id: string; meter_start: string; meter_end: string };
export type DraftSale = { row_id: string; dispenser_id: string; cash_amount: string; cashless_amount: string };
export type DraftLoss = { row_id: string; loss_id: string; direction: 'loss' | 'gain'; reason_code: string; liters: string; cash_amount: string | null; note: string | null };
export type DraftEvidence = { loss_row_id: string; evidence_type: string; object_key: string; content_hash: string; size_bytes: number; mime: string };
export type DraftState = { draft_id: string; shift_id: string; status: 'editing' | 'submitting' | 'submitted' | 'failed' | 'recovering'; revision: number; readings: DraftReading[]; sales: DraftSale[]; losses: DraftLoss[]; evidence?: DraftEvidence[]; reason_codes?: string[]; evidence_mode?: 'wajib' | 'opsional'; nozzles?: { nozzle_id: string; label?: string; meter_max: string }[]; dispensers?: { dispenser_id: string; label?: string }[] };
export type OpenShiftInput = { station_id: string; opened_at?: string };
export type RevisionResponse = { revision: number };
export type SubmitInput = { shift_id: string; draft_id: string; claim_token: string; revision: number; hash_version: number; readings: readonly { nozzle_id: string; meter_start: string; meter_end: string }[]; sales: readonly { dispenser_id: string; cash_amount: string; cashless_amount: string }[]; losses: readonly { loss_id: string; direction: 'loss' | 'gain'; reason_code: string; liters: string; cash_amount: string; note: string }[] };

export function getShifts() { return apiFetch<ShiftListItem[]>('/shifts'); }
export function getDraft(shiftId: string) { return apiFetch<DraftState>(`/draft?shift_id=${encodeURIComponent(shiftId)}`); }
export function openShift(input: OpenShiftInput) { return apiFetch<{ shift_id: string }>('/shift/open', { method: 'POST', body: JSON.stringify(input) }); }
export function claimDraft(shiftId: string) { return apiFetch<{ draft_id: string; claim_token: string; revision: number }>('/draft/claim', { method: 'POST', body: JSON.stringify({ shift_id: shiftId }) }); }
export function heartbeatDraft(draftId: string, claimToken: string) { return apiFetch<{ renewed: boolean }>('/draft/heartbeat', { method: 'POST', body: JSON.stringify({ draft_id: draftId, claim_token: claimToken }) }); }
export function writeDraftReading(input: { draft_id: string; claim_token: string; revision: number; nozzle_id: string; meter_start: string; meter_end: string }) { return apiFetch<RevisionResponse>('/draft/reading', { method: 'POST', body: JSON.stringify(input) }); }
export function writeDraftSales(input: { draft_id: string; claim_token: string; revision: number; dispenser_id: string; cash_amount: string; cashless_amount: string }) { return apiFetch<RevisionResponse>('/draft/sales', { method: 'POST', body: JSON.stringify(input) }); }
export function writeDraftLoss(input: { draft_id: string; claim_token: string; revision: number; loss_id: string; direction: 'loss' | 'gain'; reason_code: string; liters: string; cash_amount: string; note: string }) { return apiFetch<RevisionResponse>('/draft/loss', { method: 'POST', body: JSON.stringify(input) }); }
export function uploadDraftEvidence(input: { draft_id: string; claim_token: string; revision: number; loss_row_id: string; evidence_type: string; object_key: string; content_hash: string; size_bytes: number; mime: string }) { return apiFetch<RevisionResponse>('/draft/evidence', { method: 'POST', body: JSON.stringify(input) }); }
export function submitShift(input: SubmitInput, idempotencyKey: string) { return apiFetch<{ report_id: string; replay: boolean }>('/shift/submit', { method: 'POST', headers: { 'Idempotency-Key': idempotencyKey }, body: JSON.stringify(input) }); }
