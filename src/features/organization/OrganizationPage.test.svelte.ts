import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiUrl } from '../../../test/mocks/handlers';
import { server } from '../../../test/mocks/server';
import OrganizationPage from './OrganizationPage.svelte';

const organization = { id: 'org-1', name: 'PomKita', legal_name: 'PT PomKita', address: 'Jakarta', contact_email: 'admin@pomkita.id', timezone: 'Asia/Jakarta', enabled: true };
const navigation = vi.hoisted(() => ({ invalidateAll: vi.fn().mockResolvedValue(undefined) }));
vi.mock('$app/navigation', () => navigation);

afterEach(() => { vi.clearAllMocks(); vi.unstubAllGlobals(); });

describe('OrganizationPage', () => {
	it('shows the owner card without create or disable controls', () => {
		render(OrganizationPage, { organizations: [organization], isOwner: true, isSuperadmin: false });

		expect(screen.getByRole('heading', { name: 'Organisasi' })).toBeInTheDocument();
		expect(screen.getByText('PomKita')).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: /Tambah organisasi/i })).not.toBeInTheDocument();
		expect(screen.queryByRole('button', { name: /Nonaktifkan organisasi/i })).not.toBeInTheDocument();
		expect(screen.queryByLabelText('Status aktif')).not.toBeInTheDocument();
	});

	it('shows the required first station and sends a superadmin create request', async () => {
		let body: unknown;
		server.use(http.post(`${apiUrl}/organizations`, async ({ request }) => { body = await request.json(); return HttpResponse.json(organization, { status: 201 }); }));
		render(OrganizationPage, { organizations: [], isOwner: false, isSuperadmin: true });

		expect(screen.getByText(/stasiun pertama wajib diisi/i)).toBeInTheDocument();
		fireEvent.input(screen.getByLabelText('Nama organisasi'), { target: { value: 'Baru' } });
		fireEvent.input(screen.getByLabelText('Nama badan hukum'), { target: { value: 'PT Baru' } });
		fireEvent.input(screen.getByLabelText('Alamat organisasi'), { target: { value: 'Bandung' } });
		fireEvent.input(screen.getByLabelText('Email kontak organisasi'), { target: { value: 'baru@pomkita.id' } });
		fireEvent.change(screen.getByLabelText('Zona waktu organisasi'), { target: { value: 'Asia/Makassar' } });
		fireEvent.input(screen.getByLabelText('Nama stasiun pertama'), { target: { value: 'Stasiun A' } });
		fireEvent.change(screen.getByLabelText('Zona waktu stasiun pertama'), { target: { value: 'Asia/Makassar' } });
		await fireEvent.submit(screen.getByRole('button', { name: 'Tambah organisasi' }).closest('form')!);

		await waitFor(() => expect(body).toEqual({ name: 'Baru', legal_name: 'PT Baru', address: 'Bandung', contact_email: 'baru@pomkita.id', timezone: 'Asia/Makassar', first_station: { name: 'Stasiun A', timezone: 'Asia/Makassar' } }));
		expect(navigation.invalidateAll).toHaveBeenCalled();
	});

	it('shows RFC 7807 field errors and keeps input on conflict', async () => {
		server.use(http.patch(`${apiUrl}/organizations/org-1`, () => HttpResponse.json({ type: 'https://example.com/problems/conflict', title: 'Conflict', status: 409, detail: 'Perubahan bertabrakan.' }, { status: 409 })));
		render(OrganizationPage, { organizations: [organization], isOwner: true, isSuperadmin: false });
		const name = screen.getByLabelText('Nama organisasi');
		fireEvent.input(name, { target: { value: 'Nama yang belum tersimpan' } });
		await fireEvent.submit(name.closest('form')!);

		await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Perubahan bertabrakan'));
		expect(name).toHaveValue('Nama yang belum tersimpan');
	});

	it('does not send enabled from an owner form', async () => {
		let body: Record<string, unknown> | undefined;
		server.use(http.patch(`${apiUrl}/organizations/org-1`, async ({ request }) => { body = await request.json() as Record<string, unknown>; return HttpResponse.json(organization); }));
		render(OrganizationPage, { organizations: [organization], isOwner: true, isSuperadmin: false });
		await fireEvent.submit(screen.getByLabelText('Nama organisasi').closest('form')!);

		await waitFor(() => expect(body).toBeDefined());
		expect(body).not.toHaveProperty('enabled');
	});

	it('confirms before disabling and shows the disabled state', async () => {
		const confirm = vi.fn().mockReturnValue(true);
		vi.stubGlobal('confirm', confirm);
		server.use(http.post(`${apiUrl}/organizations/org-1/disable`, () => new HttpResponse(null, { status: 204 })));
		render(OrganizationPage, { organizations: [organization], isOwner: false, isSuperadmin: true });
		await fireEvent.click(screen.getByRole('button', { name: /Nonaktifkan organisasi/i }));

		expect(confirm).toHaveBeenCalled();
		await waitFor(() => expect(navigation.invalidateAll).toHaveBeenCalled());
		expect(screen.getByText('Dinonaktifkan')).toBeInTheDocument();
	});
});
