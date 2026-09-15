import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiUrl } from '../../../test/mocks/handlers';
import { server } from '../../../test/mocks/server';
import InvitationForm from './InvitationForm.svelte';

const navigation = vi.hoisted(() => ({ goto: vi.fn().mockResolvedValue(undefined) }));
vi.mock('$app/navigation', () => navigation);

afterEach(() => vi.clearAllMocks());

function fillForm(username = 'budi.s') {
	fireEvent.input(screen.getByLabelText('Nama pengguna'), { target: { value: username } });
	fireEvent.input(screen.getByLabelText('Kata sandi'), { target: { value: 'strong-password' } });
	fireEvent.input(screen.getByLabelText('Nama lengkap'), { target: { value: 'Budi Santoso' } });
}

describe('invitation form', () => {
	it('shows no form when the token is missing', () => {
		render(InvitationForm, { token: '' });

		expect(screen.getByRole('alert')).toHaveTextContent('Tautan aktivasi tidak memiliki token.');
		expect(screen.queryByRole('button', { name: 'Aktifkan akun' })).not.toBeInTheDocument();
	});

	it('accepts the invitation, shows success, and goes to sign in', async () => {
		server.use(http.post(`${apiUrl}/auth/invitations/accept`, () => new HttpResponse(null, { status: 204 })));
		render(InvitationForm, { token: 'invite-token' });
		fillForm();
		await fireEvent.click(screen.getByRole('button', { name: 'Aktifkan akun' }));

		await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Akun berhasil diaktifkan. Silakan masuk.'));
		expect(navigation.goto).toHaveBeenCalledWith('/masuk');
	});

	it('shows invalid-token feedback and does not submit again', async () => {
		let requests = 0;
		server.use(http.post(`${apiUrl}/auth/invitations/accept`, () => {
			requests += 1;
			return HttpResponse.json({ code: 'INVALID_TOKEN', type: 'https://example.com/problems/invalid-token', status: 400, detail: 'Token tidak valid.' }, { status: 400 });
		}));
		render(InvitationForm, { token: 'used-token' });
		fillForm();
		await fireEvent.click(screen.getByRole('button', { name: 'Aktifkan akun' }));

		await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Tautan tidak valid atau sudah dipakai.'));
		expect(screen.queryByRole('button', { name: 'Aktifkan akun' })).not.toBeInTheDocument();
		expect(navigation.goto).not.toHaveBeenCalled();
		expect(requests).toBe(1);
	});

	it('shows backend field errors and enforces the username rules', async () => {
		let requests = 0;
		server.use(http.post(`${apiUrl}/auth/invitations/accept`, () => {
			requests += 1;
			return HttpResponse.json({ type: 'https://example.com/problems/validation', status: 422, errors: [
				{ location: 'username', message: 'Nama pengguna sudah digunakan.' },
				{ location: 'password', message: 'Kata sandi terlalu lemah.' }
			] }, { status: 422 });
		}));
		render(InvitationForm, { token: 'invite-token' });
		fillForm('Budi!');
		await fireEvent.click(screen.getByRole('button', { name: 'Aktifkan akun' }));

		expect(screen.getByLabelText('Nama pengguna')).toBeInvalid();
		expect(requests).toBe(0);

		fillForm('budi.s');
		await fireEvent.click(screen.getByRole('button', { name: 'Aktifkan akun' }));
		await waitFor(() => expect(screen.getByText('Nama pengguna sudah digunakan.')).toBeInTheDocument());
		expect(screen.getByText('Kata sandi terlalu lemah.')).toBeInTheDocument();
	});
});
