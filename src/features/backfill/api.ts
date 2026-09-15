import { apiFetch } from '$lib/api/client';

export type BackfillInput = {
	station_id: string; opened_at: string; backfilled: boolean; original_event_date: string; shift_ke: number; backfill_approver: string; backfill_reason: string;
};
export type BackfillResult = { shift_id: string; station_seq?: number; business_date?: string; status?: string };

export function openBackfill(input: BackfillInput) {
	return apiFetch<BackfillResult>('/shifts', { method: 'POST', body: JSON.stringify(input) });
}
