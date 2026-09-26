import { apiFetch } from '$lib/api/client';

export type Session = {
	user_id: string;
	username: string;
	display_name: string;
	roles: string[] | null;
	org_id: string;
	station_ids: string[] | null;
	active_context: { org_id: string; station_id: string } | null;
};

export function hasRole(roles: string[] | null | undefined, role: string) {
	return (roles ?? []).some((item) => item.toLowerCase() === role.toLowerCase());
}

export type LoginInput = {
	username: string;
	password: string;
};

export function login(input: LoginInput) {
	return apiFetch<void>('/login', {
		method: 'POST',
		body: JSON.stringify(input)
	});
}

export function logout() {
	return apiFetch<void>('/logout', { method: 'DELETE' });
}

export function getSession() {
	return apiFetch<Session>('/session');
}
