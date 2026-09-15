import { apiFetch } from '$lib/api/client';

export type Session = {
	user_id: string;
	display_name: string;
	roles: string[] | null;
	org_id: string;
	station_ids: string[] | null;
};

export type LoginInput = {
	email: string;
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
