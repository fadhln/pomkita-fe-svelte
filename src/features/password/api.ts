import { apiFetch } from '$lib/api/client';

export function forgotPassword(input: { identifier: string }) {
	return apiFetch<void>('/auth/password/forgot', { method: 'POST', body: JSON.stringify(input) });
}

export function resetPassword(input: { token: string; password: string }) {
	return apiFetch<void>('/auth/password/reset', { method: 'POST', body: JSON.stringify(input) });
}
