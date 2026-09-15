import { apiFetch } from '$lib/api/client';
import type { ShiftDetail, ShiftListItem } from '../shift-entry/api';

export type ReportReading = { nozzle_id: string; meter_start: string; meter_end: string; expected_sale: string };
export type ReportSale = { dispenser_id: string; cash_amount: string; cashless_amount: string };
export type ReportLoss = { row_id: string; loss_id: string; direction: string; liters: string; cash_amount?: string; note?: string };
export type ReportView = {
	report_id: string; station_id: string; shift_id: string; version_no: number; status: string; submitted_at: string;
	readings: ReportReading[] | null; sales: ReportSale[] | null; losses: ReportLoss[] | null;
};

export type ReportListItem = ShiftListItem & { current_report_id: string };

function stationQuery(stationId: string) { return `?station_id=${encodeURIComponent(stationId)}`; }

export async function getReportShifts(stationId: string) {
	const rows = await apiFetch<ShiftListItem[] | null>(`/shifts${stationQuery(stationId)}`);
	return (rows ?? []).filter((row): row is ReportListItem => Boolean(row.current_report_id));
}

export function getReport(reportId: string, stationId: string) {
	return apiFetch<ReportView>(`/reports/${encodeURIComponent(reportId)}${stationQuery(stationId)}`);
}

export function getReportPrintout(reportId: string, stationId: string) {
	return apiFetch<ReportView>(`/reports/${encodeURIComponent(reportId)}/printout${stationQuery(stationId)}`);
}

export function getReportShift(shiftId: string, stationId: string) {
	return apiFetch<ShiftDetail>(`/shifts/${encodeURIComponent(shiftId)}${stationQuery(stationId)}`);
}
