import type { AuditRow } from './api';

export function formatAuditDate(value: string) {
	return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(new Date(value)).replace(', ', ' ');
}
export function auditLabel(row: AuditRow) {
	return { sequence: String(row.org_sequence), date: formatAuditDate(row.created_at) };
}
