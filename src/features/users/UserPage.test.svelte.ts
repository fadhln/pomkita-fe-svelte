import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiUrl } from '../../../test/mocks/handlers';
import { server } from '../../../test/mocks/server';
import UserPage from './UserPage.svelte';

const navigation = vi.hoisted(() => ({ invalidateAll: vi.fn().mockResolvedValue(undefined) }));
vi.mock('$app/navigation', () => navigation);
afterEach(() => vi.clearAllMocks());

const invited = { id: 'user-invited', email: 'undangan@example.com', display_name: 'Undangan', username: null, enabled: true, roles: [{ role: 'Operator', station_id: 'station-1', station_name: 'Stasiun Utama' }] };
const active = { id: 'user-active', email: 'aktif@example.com', display_name: 'Aktif', username: 'aktif', enabled: true, roles: [{ role: 'Supervisor', station_id: 'station-1', station_name: 'Stasiun Utama' }] };

function renderOwner() {
	return render(UserPage, { users: [invited, active], isOwner: true, isSuperadmin: false, authorized: true, stationIds: ['station-1'] });
}

describe('user administration screen', () => {
	it('shows invited state and Owner role restrictions', () => {
		renderOwner();
		expect(screen.getByText('Belum diaktifkan')).toBeInTheDocument();
		expect(screen.getByText('Undangan')).toBeInTheDocument();
		expect(screen.queryByRole('option', { name: 'Owner' })).not.toBeInTheDocument();
		expect(screen.queryByRole('option', { name: 'Superadmin' })).not.toBeInTheDocument();
	});

	it('invites a user and invalidates the page', async () => {
		server.use(http.post(`${apiUrl}/users`, () => HttpResponse.json({ id: 'new-user' }, { status: 201 })));
		renderOwner();
		fireEvent.input(screen.getByLabelText('Email'), { target: { value: 'baru@example.com' } });
		fireEvent.input(screen.getByLabelText('Nama lengkap'), { target: { value: 'Pengguna Baru' } });
		await fireEvent.click(screen.getByRole('button', { name: 'Kirim undangan' }));
		await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Undangan berhasil dikirim.'));
		expect(navigation.invalidateAll).toHaveBeenCalled();
	});

	it('shows duplicate email on the email field', async () => {
		server.use(http.post(`${apiUrl}/users`, () => HttpResponse.json({ type: 'https://example.com/problems/conflict', status: 409, detail: 'Email sudah digunakan.', errors: [{ location: 'body.email', message: 'Email sudah digunakan.' }] }, { status: 409 })));
		renderOwner();
		fireEvent.input(screen.getByLabelText('Email'), { target: { value: 'sudah@example.com' } });
		fireEvent.input(screen.getByLabelText('Nama lengkap'), { target: { value: 'Pengguna' } });
		await fireEvent.click(screen.getByRole('button', { name: 'Kirim undangan' }));
		await waitFor(() => expect(screen.getByText('Email sudah digunakan.')).toBeInTheDocument());
		expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
	});

	it('explains that a station is required when the organization has none', async () => {
		server.use(http.post(`${apiUrl}/users`, () => HttpResponse.json({ code: 'station_required', status: 422, detail: 'Organisasi harus memiliki stasiun.' }, { status: 422 })));
		renderOwner();
		fireEvent.input(screen.getByLabelText('Email'), { target: { value: 'tanpa-stasiun@example.com' } });
		fireEvent.input(screen.getByLabelText('Nama lengkap'), { target: { value: 'Pengguna' } });
		await fireEvent.click(screen.getByRole('button', { name: 'Kirim undangan' }));
		await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Organisasi harus memiliki stasiun terlebih dahulu.'));
	});

	it('shows the detail, roles, history, and reset link once', async () => {
		server.use(
			http.get(`${apiUrl}/users/user-active`, () => HttpResponse.json({ ...active, stations: [{ id: 'station-1', name: 'Stasiun Utama' }] })),
			http.get(`${apiUrl}/users/user-active/role-history`, () => HttpResponse.json([{ sequence: 1, actor: 'admin', target: 'aktif', station: 'Stasiun Utama', role: 'Supervisor', before: null, after: 'Supervisor', created_at: '2026-09-15T10:00:00Z' }])),
			http.post(`${apiUrl}/users/user-active/password-reset`, () => HttpResponse.json({ link: 'https://example.test/reset/one-time' }))
		);
		renderOwner();
		await fireEvent.click(screen.getByRole('button', { name: 'Lihat Aktif' }));
		await waitFor(() => expect(screen.getByRole('button', { name: 'Kirim tautan reset' })).toBeInTheDocument());
		await fireEvent.click(screen.getByRole('button', { name: 'Kirim tautan reset' }));
		await waitFor(() => expect(screen.getByText('https://example.test/reset/one-time')).toBeInTheDocument());
		expect(screen.getAllByText('Supervisor').length).toBeGreaterThan(0);
		expect(screen.getByText('admin')).toBeInTheDocument();
		expect(screen.getByText('Tautan tidak akan ditampilkan lagi.')).toBeInTheDocument();
	});

	it('hides management actions for an Owner viewing an Owner user', async () => {
		const owner = { id: 'user-owner', email: 'owner@example.com', display_name: 'Pemilik', username: 'pemilik', enabled: true, roles: [{ role: 'Owner', station_id: 'station-1' }] };
		server.use(
			http.get(`${apiUrl}/users/user-owner`, () => HttpResponse.json({ ...owner, stations: [{ id: 'station-1' }] })),
			http.get(`${apiUrl}/users/user-owner/role-history`, () => HttpResponse.json([]))
		);
		render(UserPage, { users: [owner], isOwner: true, isSuperadmin: false, authorized: true, stationIds: ['station-1'] });
		await fireEvent.click(screen.getByRole('button', { name: 'Lihat Pemilik' }));
		await waitFor(() => expect(screen.getByText('Owner tidak dapat mengubah pengguna Owner atau Superadmin.')).toBeInTheDocument());
		expect(screen.queryByRole('button', { name: 'Simpan perubahan' })).not.toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Kirim tautan reset' })).not.toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Tambah peran' })).not.toBeInTheDocument();
	});
});
