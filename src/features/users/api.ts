import { apiFetch } from '$lib/api/client';

export type UserRole = { role: string; station_id: string; station_name?: string | null };
export type UserSummary = { id: string; email: string; display_name: string; username?: string | null; enabled: boolean; roles: UserRole[] };
export type UserStation = { id: string; name?: string | null };
export type UserDetail = UserSummary & { stations: UserStation[] };
export type RoleHistoryEvent = {
	sequence: number;
	actor: string;
	target: string;
	station?: string | null;
	station_id?: string | null;
	role: string;
	before: unknown;
	after: unknown;
	created_at: string;
};
export type InviteUserInput = { email: string; display_name: string; role: string; station_id: string };
export type UpdateUserInput = { display_name: string; enabled: boolean };
export type RoleInput = { station_id: string; role: string };

function record(value: unknown): Record<string, unknown> {
	return typeof value === 'object' && value !== null ? value as Record<string, unknown> : {};
}

function roleView(value: unknown): UserRole {
	if (typeof value === 'string') return { role: value, station_id: '' };
	const source = record(value);
	const station = record(source.station);
	return { role: String(source.role ?? ''), station_id: String(source.station_id ?? station.id ?? ''), station_name: typeof source.station_name === 'string' ? source.station_name : typeof station.name === 'string' ? station.name : undefined };
}

function userView(value: unknown): UserDetail {
	const source = record(value);
	const roles = Array.isArray(source.roles) ? source.roles.map(roleView) : [];
	const stations = Array.isArray(source.stations) ? source.stations.map((station) => {
		if (typeof station === 'string') return { id: station };
		const item = record(station);
		return { id: String(item.id ?? item.station_id ?? ''), name: typeof item.name === 'string' ? item.name : undefined };
	}) : [];
	return { id: String(source.id ?? source.user_id ?? ''), email: String(source.email ?? ''), display_name: String(source.display_name ?? ''), username: typeof source.username === 'string' && source.username ? source.username : null, enabled: Boolean(source.enabled), roles, stations };
}

function listViews(value: unknown) {
	const source = record(value);
	const list = Array.isArray(value) ? value : Array.isArray(source.users) ? source.users : [];
	return list.map(userView);
}

export function getUsers(orgId?: string) {
	const query = orgId ? `?org_id=${encodeURIComponent(orgId)}` : '';
	return apiFetch<unknown>(`/users${query}`).then(listViews);
}

export function createUser(input: InviteUserInput) {
	return apiFetch<unknown>('/users', { method: 'POST', body: JSON.stringify(input) }).then(userView);
}

export function getUser(id: string) {
	return apiFetch<unknown>(`/users/${encodeURIComponent(id)}`).then(userView);
}

export function updateUser(id: string, input: UpdateUserInput) {
	return apiFetch<unknown>(`/users/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(input) }).then(userView);
}

export function addUserRole(id: string, input: RoleInput) {
	return apiFetch<unknown>(`/users/${encodeURIComponent(id)}/roles`, { method: 'POST', body: JSON.stringify(input) }).then((value) => {
		const source = record(value);
		const roles = Array.isArray(value) ? value : Array.isArray(source.roles) ? source.roles : [];
		return roles.map(roleView);
	});
}

export function removeUserRole(id: string, input: RoleInput) {
	return apiFetch<void>(`/users/${encodeURIComponent(id)}/roles`, { method: 'DELETE', body: JSON.stringify(input) });
}

export function getRoleHistory(id: string) {
	return apiFetch<RoleHistoryEvent[]>(`/users/${encodeURIComponent(id)}/role-history`).then((events) => events ?? []);
}

export function resetUserPassword(id: string) {
	return apiFetch<{ link: string }>(`/users/${encodeURIComponent(id)}/password-reset`, { method: 'POST' });
}
