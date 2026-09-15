import { apiFetch } from '$lib/api/client';

export type Anomaly = {
	event_id: string;
	event_type: string;
	rule_id: string;
	source_id: string;
	source_kind: string;
	source_version_no?: number;
	station_id: string;
	subject_id: string;
	subject_kind: string;
	happened_at: string;
};

export function getAnomalies(stationId: string) {
	return apiFetch<Anomaly[] | null>(`/anomalies?station_id=${encodeURIComponent(stationId)}`);
}
