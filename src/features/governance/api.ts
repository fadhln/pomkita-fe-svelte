import { apiFetch } from '$lib/api/client';
import type { ShiftListItem } from '../shift-entry/api';

export type AmendmentQueueItem = {
	ItemID: string;
	TargetKind: string;
	TargetLogicalID: string;
	Field: string;
	OldValue: unknown;
	NewValue: unknown;
};

export type AmendmentQueueEntry = {
	AmendmentID: string;
	StationID: string;
	ShiftID: string;
	BaseReportID: string;
	BaseVersionNo: number;
	Status: string;
	Requester: { UserID: string; DisplayName: string };
	Reason: string;
	RequestedAt: string;
	StaleCheckHash: string;
	Items: AmendmentQueueItem[];
};

export type ReportView = {
	report_id: string;
	station_id: string;
	shift_id: string;
	version_no: number;
	status: string;
	submitted_at: string;
	readings: Array<{ nozzle_id: string; meter_start: string; meter_end: string; expected_sale: string }>;
	sales: Array<{ dispenser_id: string; cash_amount: string; cashless_amount: string }>;
	losses: Array<{ row_id: string; loss_id: string; direction: string; liters: string; cash_amount?: string; note?: string }>;
};

export type Acknowledgement = { AckID: string; Decision: string; IsBreakGlass: boolean; ReportID: string; ShiftStatus: string; VersionNo: number };
export type AcknowledgeInput = { reportId: string; stationId: string; shiftId: string; versionNo: number; decision: 'acked' | 'rejected'; rejectionReason?: string; isBreakGlass?: boolean; breakGlassReason?: string };

export function getAmendments() {
	return apiFetch<AmendmentQueueEntry[] | null>('/amendments');
}

export function approveAmendment(input: { amendmentId: string; stationId: string; staleCheckHash: string }) {
	return apiFetch<Record<string, unknown>>(`/amendments/${encodeURIComponent(input.amendmentId)}/approve`, { method: 'POST', body: JSON.stringify({ station_id: input.stationId, stale_check_hash: input.staleCheckHash }) });
}

export function rejectAmendment(input: { amendmentId: string; stationId: string; rejectionReason: string }) {
	return apiFetch<void>(`/amendments/${encodeURIComponent(input.amendmentId)}/reject`, { method: 'POST', body: JSON.stringify({ station_id: input.stationId, rejection_reason: input.rejectionReason }) });
}

export function getAwaitingConfirmation(stationId: string) {
	return apiFetch<ShiftListItem[] | null>(`/shifts?station_id=${encodeURIComponent(stationId)}`).then((shifts) => (shifts ?? []).filter((shift) => shift.status === 'awaiting_confirmation' && Boolean(shift.current_report_id)));
}

export function getReport(reportId: string, stationId: string) {
	return apiFetch<ReportView>(`/reports/${encodeURIComponent(reportId)}?station_id=${encodeURIComponent(stationId)}`);
}

export function acknowledgeReport(input: AcknowledgeInput) {
	const body: Record<string, unknown> = { station_id: input.stationId, shift_id: input.shiftId, version_no: input.versionNo, decision: input.decision, is_break_glass: input.isBreakGlass ?? false };
	if (input.rejectionReason?.trim()) body.rejection_reason = input.rejectionReason.trim();
	if (input.breakGlassReason?.trim()) body.break_glass_reason = input.breakGlassReason.trim();
	return apiFetch<Acknowledgement>(`/reports/${encodeURIComponent(input.reportId)}/acknowledgement`, { method: 'POST', body: JSON.stringify(body) });
}
