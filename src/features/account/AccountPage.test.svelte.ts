import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { accountFixture, apiUrl } from '../../../test/mocks/handlers';
import { server } from '../../../test/mocks/server';
import AccountPage from './AccountPage.svelte';

const navigation = vi.hoisted(() => ({ invalidateAll: vi.fn().mockResolvedValue(undefined) }));
vi.mock('$app/navigation', () => navigation);

afterEach(() => vi.clearAllMocks());

function renderAccount() {
	return render(AccountPage, { account: accountFixture });
}

describe('account screen', () => {
	it('shows the profile, roles, and stations', () => {
		renderAccount();

		expect(screen.getByRole('heading', { name: 'Akun' })).toBeInTheDocument();
		expect(screen.getByText('budi@example.com')).toBeInTheDocument();
		expect(screen.getByText('test.user')).toBeInTheDocument();
		expect(screen.getByText('Test User')).toBeInTheDocument();
		expect(screen.getByText('Organisasi PomKita')).toBeInTheDocument();
		expect(screen.getByText('Supervisor')).toBeInTheDocument();
		expect(screen.getByText('33333333-3333-4333-8333-333333333333')).toBeInTheDocument();
	});

	it('shows the updated profile after saving changes', async () => {
		renderAccount();
		fireEvent.input(screen.getByLabelText('Nama lengkap'), { target: { value: 'Budi Baru' } });
		fireEvent.input(screen.getByLabelText('Nama pengguna'), { target: { value: 'budi.baru' } });
		await fireEvent.click(screen.getByRole('button', { name: 'Simpan perubahan' }));

		await waitFor(() => expect(screen.getByText('Budi Baru')).toBeInTheDocument());
		expect(screen.getByText('budi.baru')).toBeInTheDocument();
		expect(screen.getByRole('status')).toHaveTextContent('Perubahan akun disimpan.');
		expect(navigation.invalidateAll).toHaveBeenCalled();
	});

	it('shows password success after a 204 response', async () => {
		renderAccount();
		fireEvent.input(screen.getByLabelText('Kata sandi saat ini'), { target: { value: 'old-password' } });
		fireEvent.input(screen.getByLabelText('Kata sandi baru'), { target: { value: 'new-password' } });
		await fireEvent.click(screen.getByRole('button', { name: 'Ubah kata sandi' }));

		await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Kata sandi berhasil diubah.'));
	});

	it('shows wrong current password on the current-password field', async () => {
		server.use(http.post(`${apiUrl}/account/password`, () => HttpResponse.json({ code: 'INVALID_CURRENT_PASSWORD', status: 422, detail: 'Kata sandi saat ini salah.' }, { status: 422 })));
		renderAccount();
		fireEvent.input(screen.getByLabelText('Kata sandi saat ini'), { target: { value: 'wrong-password' } });
		fireEvent.input(screen.getByLabelText('Kata sandi baru'), { target: { value: 'new-password' } });
		await fireEvent.click(screen.getByRole('button', { name: 'Ubah kata sandi' }));

		await waitFor(() => expect(screen.getByText('Kata sandi saat ini salah.')).toBeInTheDocument());
		expect(screen.getByLabelText('Kata sandi saat ini')).toHaveAttribute('aria-invalid', 'true');
	});

	it('shows a duplicate username message on the username field', async () => {
		server.use(http.patch(`${apiUrl}/account`, () => HttpResponse.json({ type: 'https://example.com/problems/conflict', title: 'Conflict', status: 409, detail: 'Nama pengguna sudah digunakan.' }, { status: 409 })));
		renderAccount();
		fireEvent.input(screen.getByLabelText('Nama pengguna'), { target: { value: 'taken.user' } });
		await fireEvent.click(screen.getByRole('button', { name: 'Simpan perubahan' }));

		await waitFor(() => expect(screen.getByText('Nama pengguna sudah digunakan.')).toBeInTheDocument());
		expect(screen.getByLabelText('Nama pengguna')).toHaveAttribute('aria-invalid', 'true');
	});
});
