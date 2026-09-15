import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiUrl } from '../../../test/mocks/handlers';
import { server } from '../../../test/mocks/server';
import StationPage from './StationPage.svelte';

const station = { id: 'station-1', name: 'Kebayoran', code: 'KBY', address: 'Jakarta', timezone: 'Asia/Jakarta', enabled: true };
const navigation = vi.hoisted(() => ({ invalidateAll: vi.fn().mockResolvedValue(undefined) }));
vi.mock('$app/navigation', () => navigation);

afterEach(() => { vi.clearAllMocks(); vi.unstubAllGlobals(); });

describe('StationPage', () => {
	it('shows station details and the disable safety explanation', () => {
		render(StationPage, { stations: [station], isOwner: true, isSuperadmin: false });

		expect(screen.getByRole('heading', { name: 'Stasiun' })).toBeInTheDocument();
		expect(screen.getByText('KBY')).toBeInTheDocument();
		expect(screen.getByText(/laporan atau baris peran/i)).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: /Hapus/i })).not.toBeInTheDocument();
	});

	it('creates and disables a station after confirmation', async () => {
		let body: unknown;
		const confirm = vi.fn().mockReturnValue(true);
		vi.stubGlobal('confirm', confirm);
		server.use(
			http.post(`${apiUrl}/stations`, async ({ request }) => { body = await request.json(); return HttpResponse.json(station, { status: 201 }); }),
			http.post(`${apiUrl}/stations/station-1/disable`, () => new HttpResponse(null, { status: 204 }))
		);
		render(StationPage, { stations: [station], isOwner: true, isSuperadmin: false });
		fireEvent.input(screen.getByLabelText('Nama stasiun baru'), { target: { value: 'Cilandak' } });
		fireEvent.input(screen.getByLabelText('Kode stasiun baru'), { target: { value: 'CLD' } });
		fireEvent.input(screen.getByLabelText('Alamat stasiun baru'), { target: { value: 'Jakarta Selatan' } });
		await fireEvent.submit(screen.getByRole('button', { name: 'Tambah stasiun' }).closest('form')!);
		await waitFor(() => expect(body).toEqual({ name: 'Cilandak', code: 'CLD', address: 'Jakarta Selatan', timezone: 'Asia/Jakarta' }));
		await waitFor(() => expect(screen.getByRole('button', { name: 'Simpan stasiun' })).not.toBeDisabled());
		await fireEvent.click(screen.getByRole('button', { name: /Nonaktifkan stasiun/i }));
		await waitFor(() => expect(screen.queryByRole('button', { name: /Nonaktifkan stasiun/i })).not.toBeInTheDocument());
		expect(confirm).toHaveBeenCalled();
		expect(screen.getAllByText('Dinonaktifkan').length).toBeGreaterThan(0);
	});
});
