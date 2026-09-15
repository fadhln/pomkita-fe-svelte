import { apiFetch } from '$lib/api/client';

export type InvitationInput = {
	token: string;
	username: string;
	password: string;
	display_name: string;
};

export function acceptInvitation(input: InvitationInput) {
	return apiFetch<void>('/auth/invitations/accept', {
		method: 'POST',
		body: JSON.stringify(input)
	});
}
