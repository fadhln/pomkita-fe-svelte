import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiUrl } from '../../../test/mocks/handlers';
import { server } from '../../../test/mocks/server';
import { clearActiveStationCookie } from '$lib/station/active';
import { load as shiftLoad } from '../../routes/shift/+page';
import Topbar from './Topbar.svelte';

const navigation = vi.hoisted(() => ({
	goto: vi.fn().mockResolvedValue(undefined),
	invalidateAll: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('$app/navigation', () => navigation);

afterEach(() => {
	vi.clearAllMocks();
	clearActiveStationCookie();
	window.history.replaceState({}, '', '/');
});

const twoStations = {
	user_id: 'user-1', username: 'owner', display_name: 'Owner', roles: ['Owner'], org_id: 'org-1', station_ids: ['station-1', 'station-2']
};

describe('Topbar', () => {
	it('places the account link near sign out', () => {
		render(Topbar);
		expect(screen.getByRole('link', { name: 'Akun' })).toHaveAttribute('href', '/akun');
	});

	it('logs out and returns to Masuk', async () => {
		render(Topbar);
		await fireEvent.click(screen.getByRole('button', { name: 'Keluar' }));

		await waitFor(() => expect(navigation.goto).toHaveBeenCalledWith('/masuk'));
		expect(navigation.invalidateAll).toHaveBeenCalled();
	});

	it('shows the permitted stations and their names for a multi-station session', () => {
		render(Topbar, { session: twoStations, stations: [{ id: 'station-1', name: 'Stasiun Utama' }, { id: 'station-2', name: 'Stasiun Timur' }] });

		const switcher = screen.getByRole('combobox', { name: 'Stasiun aktif' });
		expect(switcher).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Stasiun Utama' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Stasiun Timur' })).toBeInTheDocument();
	});

	it('does not show a switcher for a single-station session', () => {
		render(Topbar, { session: { ...twoStations, station_ids: ['station-1'] }, stations: [{ id: 'station-1', name: 'Stasiun Utama' }] });

		expect(screen.queryByRole('combobox', { name: 'Stasiun aktif' })).not.toBeInTheDocument();
		expect(screen.getByText('Stasiun Utama')).toBeInTheDocument();
	});

	it('shows the identifier when a station name is unavailable', () => {
		render(Topbar, { session: twoStations, stations: [{ id: 'station-1', name: 'Stasiun Utama' }, { id: 'station-2' }] });

		expect(screen.getByRole('option', { name: 'station-2' })).toBeInTheDocument();
	});

	it('writes the new station and invalidates the current route', async () => {
		render(Topbar, { session: twoStations, stations: [{ id: 'station-1' }, { id: 'station-2' }] });

		await fireEvent.change(screen.getByRole('combobox', { name: 'Stasiun aktif' }), { target: { value: 'station-2' } });

		await waitFor(() => expect(navigation.invalidateAll).toHaveBeenCalled());
		expect(document.cookie).toContain('pomkita_active_station=station-2');
	});

	it('uses the switched station in the next station-scoped load', async () => {
		let requestedStation = '';
		server.use(http.get(`${apiUrl}/shifts`, ({ request }) => {
			requestedStation = new URL(request.url).searchParams.get('station_id') ?? '';
			return HttpResponse.json([]);
		}));
		render(Topbar, { session: twoStations, stations: [{ id: 'station-1' }, { id: 'station-2' }] });

		await fireEvent.change(screen.getByRole('combobox', { name: 'Stasiun aktif' }), { target: { value: 'station-2' } });
		await waitFor(() => expect(navigation.invalidateAll).toHaveBeenCalled());
		await shiftLoad({ parent: async () => ({ session: twoStations }) } as never);

		expect(requestedStation).toBe('station-2');
	});

	it('asks for confirmation before switching on shift entry', async () => {
		window.history.replaceState({}, '', '/shift/shift-1');
		const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
		render(Topbar, { session: twoStations, stations: [{ id: 'station-1' }, { id: 'station-2' }] });

		await fireEvent.change(screen.getByRole('combobox', { name: 'Stasiun aktif' }), { target: { value: 'station-2' } });

		expect(confirm).toHaveBeenCalledWith('Perubahan yang belum disimpan akan hilang. Ganti stasiun?');
		expect(navigation.invalidateAll).not.toHaveBeenCalled();
	});
});
