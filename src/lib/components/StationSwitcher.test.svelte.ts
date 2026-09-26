import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiUrl } from '../../../test/mocks/handlers';
import { server } from '../../../test/mocks/server';
import StationSwitcher from './StationSwitcher.svelte';

const navigation = vi.hoisted(() => ({ invalidateAll: vi.fn().mockResolvedValue(undefined) }));
vi.mock('$app/navigation', () => navigation);

const superadminSession = {
	user_id: 'user-1', username: 'root', display_name: 'Root', roles: ['Superadmin'], org_id: 'org-home',
	station_ids: [], active_context: { org_id: 'org-selected', station_id: 'station-selected' }
};
const stations = [
	{ id: 'station-selected', name: 'Stasiun Utama', enabled: true },
	{ id: 'station-other', name: 'Stasiun Timur', enabled: true }
];
const options = (session: typeof superadminSession) => ({ session, stations, activeStationId: 'station-selected' });

afterEach(() => {
	vi.clearAllMocks();
	document.cookie = 'pomkita_active_station=; Path=/; Max-Age=0';
});

describe('StationSwitcher for a superadmin session', () => {
	it('lists every station of the active organization with the server context selected', () => {
		render(StationSwitcher, options(superadminSession));

		const switcher = screen.getByRole('combobox', { name: 'Stasiun aktif' });
		expect(switcher).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Stasiun Utama' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Stasiun Timur' })).toBeInTheDocument();
		expect(switcher).toHaveValue('station-selected');
	});

	it('sends the active organization and the selected station to the server and reloads', async () => {
		let activeContextBody: unknown;
		server.use(http.post(`${apiUrl}/session/active-context`, async ({ request }) => {
			activeContextBody = await request.json();
			return HttpResponse.json({ active_context: { org_id: 'org-selected', station_id: 'station-other' } });
		}));
		render(StationSwitcher, options(superadminSession));

		await fireEvent.change(screen.getByRole('combobox', { name: 'Stasiun aktif' }), { target: { value: 'station-other' } });

		await waitFor(() => expect(navigation.invalidateAll).toHaveBeenCalled());
		expect(activeContextBody).toEqual({ org_id: 'org-selected', station_id: 'station-other' });
		expect(document.cookie).not.toContain('pomkita_active_station=station-other');
	});

	it('shows a not-found error, keeps the server station, and skips the reload when the update fails', async () => {
		server.use(http.post(`${apiUrl}/session/active-context`, () => HttpResponse.json({ detail: 'missing' }, { status: 404 })));
		render(StationSwitcher, options(superadminSession));

		await fireEvent.change(screen.getByRole('combobox', { name: 'Stasiun aktif' }), { target: { value: 'station-other' } });

		await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Stasiun tidak ditemukan'));
		expect(screen.getByRole('combobox', { name: 'Stasiun aktif' })).toHaveValue('station-selected');
		expect(navigation.invalidateAll).not.toHaveBeenCalled();
	});

	it('shows a generic error when the update is forbidden', async () => {
		server.use(http.post(`${apiUrl}/session/active-context`, () => HttpResponse.json({ detail: 'denied' }, { status: 403 })));
		render(StationSwitcher, options(superadminSession));

		await fireEvent.change(screen.getByRole('combobox', { name: 'Stasiun aktif' }), { target: { value: 'station-other' } });

		await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Tidak dapat mengganti stasiun'));
		expect(screen.getByRole('combobox', { name: 'Stasiun aktif' })).toHaveValue('station-selected');
	});
});

describe('StationSwitcher for a non-superadmin session', () => {
	const supervisorSession = {
		user_id: 'user-2', username: 'budi', display_name: 'Budi', roles: ['Supervisor'], org_id: 'org-home',
		station_ids: ['station-selected', 'station-other'], active_context: null
	};

	it('still uses the station cookie without a server call', async () => {
		let contextCalls = 0;
		server.use(http.post(`${apiUrl}/session/active-context`, () => {
			contextCalls += 1;
			return HttpResponse.json({ active_context: { org_id: 'org-home', station_id: 'station-other' } });
		}));
		render(StationSwitcher, { session: supervisorSession, stations, activeStationId: 'station-selected' });

		await fireEvent.change(screen.getByRole('combobox', { name: 'Stasiun aktif' }), { target: { value: 'station-other' } });

		await waitFor(() => expect(navigation.invalidateAll).toHaveBeenCalled());
		expect(document.cookie).toContain('pomkita_active_station=station-other');
		expect(contextCalls).toBe(0);
	});
});
