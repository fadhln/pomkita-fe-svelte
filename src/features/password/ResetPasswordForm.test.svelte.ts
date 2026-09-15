import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiUrl } from '../../../test/mocks/handlers';
import { server } from '../../../test/mocks/server';
import ResetPasswordForm from './ResetPasswordForm.svelte';

const navigation = vi.hoisted(() => ({ goto: vi.fn().mockResolvedValue(undefined) }));
vi.mock('$app/navigation', () => navigation);

afterEach(() => vi.clearAllMocks());

function fillPasswords(password = 'new-password', confirmation = password) {
	fireEvent.input(screen.getByLabelText('Kata sandi baru'), { target: { value: password } });
	fireEvent.input(screen.getByLabelText('Ulangi kata sandi baru'), { target: { value: confirmation } });
}

describe('reset password form', () => {
	it('shows no form when the token is missing', () => {
		render(ResetPasswordForm, { token: '' });

		expect(screen.getByRole('alert')).toHaveTextContent('Tautan atur ulang tidak memiliki token.');
		expect(screen.queryByRole('button', { name: 'Atur ulang kata sandi' })).not.toBeInTheDocument();
	});

	it('does not send a request when the passwords do not match', async () => {
		let requests = 0;
		server.use(http.post(`${apiUrl}/auth/password/reset`, () => {
			requests += 1;
			return new HttpResponse(null, { status: 204 });
		}));
		render(ResetPasswordForm, { token: 'reset-token' });
		fillPasswords('new-password', 'different-password');
		await fireEvent.click(screen.getByRole('button', { name: 'Atur ulang kata sandi' }));

		expect(screen.getByRole('alert')).toHaveTextContent('Kata sandi baru tidak sama.');
		expect(requests).toBe(0);
	});

	it('shows the invalid-token message', async () => {
		server.use(http.post(`${apiUrl}/auth/password/reset`, () => HttpResponse.json({ code: 'INVALID_TOKEN', status: 400 }, { status: 400 })));
		render(ResetPasswordForm, { token: 'used-token' });
		fillPasswords();
		await fireEvent.click(screen.getByRole('button', { name: 'Atur ulang kata sandi' }));

		await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Tautan tidak valid atau sudah dipakai.'));
	});

	it('shows success and goes to sign in after reset', async () => {
		render(ResetPasswordForm, { token: 'reset-token' });
		fillPasswords();
		await fireEvent.click(screen.getByRole('button', { name: 'Atur ulang kata sandi' }));

		await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Kata sandi berhasil diatur ulang. Silakan masuk.'));
		expect(navigation.goto).toHaveBeenCalledWith('/masuk');
	});
});
