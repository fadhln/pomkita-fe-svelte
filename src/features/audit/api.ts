import { apiFetch, apiFetchText } from '$lib/api/client';

export type AuditRow = { event_id: string; org_sequence: number; event_type: string; payload: string; outcome: string; created_at: string; prev_hash: string; row_hash: string };
export type AuditVerification = { verified: boolean };
export type AuditIdentity = { station_id: string; actor_user_id: string };

export function getAuditRows() { return apiFetch<AuditRow[] | null>('/audit').then((rows) => rows ?? []); }
export function verifyAudit() { return apiFetch<AuditVerification>('/audit/verify'); }
export function exportAudit() { return apiFetchText('/audit/export'); }

function valueFor(payload: Record<string, unknown>, keys: string[]) {
	for (const key of keys) if (typeof payload[key] === 'string' && payload[key]) return payload[key] as string;
	return '';
}
export function auditPayload(row: AuditRow): Record<string, unknown> {
	try {
		const decoded = atob(row.payload);
		return JSON.parse(decoded) as Record<string, unknown>;
	} catch {
		try { return JSON.parse(row.payload) as Record<string, unknown>; } catch { return {}; }
	}
}
export function auditIdentity(row: AuditRow): AuditIdentity {
	const payload = auditPayload(row);
	const stationKeys = row.event_type.startsWith('shift.') ? ['station_id', 'station'] : ['station_id', 'station', 'station_uuid'];
	const actorKeys = row.event_type.startsWith('amendment.') ? ['actor_user_id', 'requester_id', 'approver_id', 'user_id'] : ['actor_user_id', 'actor_id', 'created_by', 'user_id', 'approver_id'];
	return { station_id: valueFor(payload, stationKeys), actor_user_id: valueFor(payload, actorKeys) };
}

export function downloadAuditCsv(csv: string) {
	const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
	const link = document.createElement('a'); link.href = url; link.download = 'audit.csv'; link.click(); URL.revokeObjectURL(url);
}
