import { apiFetch } from '$lib/api/client';

export type AccountStation = string | { id: string; name?: string };

export type Account = {
	user_id: string;
	email: string;
	username: string;
	display_name: string;
	org: { id: string; name: string };
	roles: string[];
	stations: AccountStation[];
};

export type AccountInput = { display_name: string; username: string };
export type PasswordInput = { current_password: string; new_password: string };

export function getAccount() {
	return apiFetch<Account>('/account');
}

export function updateAccount(input: AccountInput) {
	return apiFetch<Account>('/account', { method: 'PATCH', body: JSON.stringify(input) });
}

export function changePassword(input: PasswordInput) {
	return apiFetch<void>('/account/password', { method: 'POST', body: JSON.stringify(input) });
}
