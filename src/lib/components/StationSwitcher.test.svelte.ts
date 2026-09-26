import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiUrl } from '../../../test/mocks/handlers';
import { server } from '../../../test/mocks/server';
import { setUnsavedShiftEdits } from '$lib/session/unsaved';
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
	setUnsavedShiftEdits(false);
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

	it('asks for confirmation and keeps the server station when unsaved edits exist and the user cancels', async () => {
		render(StationSwitcher, options(superadminSession));
		const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
		let contextCalls = 0;
		server.use(http.post(`${apiUrl}/session/active-context`, () => {
			contextCalls += 1;
			return HttpResponse.json({ active_context: { org_id: 'org-selected', station_id: 'station-other' } });
		}));
		setUnsavedShiftEdits(true);

		await fireEvent.change(screen.getByRole('combobox', { name: 'Stasiun aktif' }), { target: { value: 'station-other' } });

		expect(confirm).toHaveBeenCalledWith('Perubahan shift yang belum disimpan akan hilang. Ganti konteks?');
		expect(contextCalls).toBe(0);
		expect(navigation.invalidateAll).not.toHaveBeenCalled();
		expect(screen.getByRole('combobox', { name: 'Stasiun aktif' })).toHaveValue('station-selected');
	});

	it('applies the change when unsaved edits exist and the user confirms', async () => {
		vi.spyOn(window, 'confirm').mockReturnValue(true);
		let activeContextBody: unknown;
		server.use(http.post(`${apiUrl}/session/active-context`, async ({ request }) => {
			activeContextBody = await request.json();
			return HttpResponse.json({ active_context: { org_id: 'org-selected', station_id: 'station-other' } });
		}));
		setUnsavedShiftEdits(true);
		render(StationSwitcher, options(superadminSession));

		await fireEvent.change(screen.getByRole('combobox', { name: 'Stasiun aktif' }), { target: { value: 'station-other' } });

		await waitFor(() => expect(navigation.invalidateAll).toHaveBeenCalled());
		expect(activeContextBody).toEqual({ org_id: 'org-selected', station_id: 'station-other' });
	});

	it('includes disabled stations in the list and marks them as arsip', () => {
		render(StationSwitcher, {
			session: superadminSession,
			stations: [...stations, { id: 'station-arsip', name: 'Stasiun Arsip', enabled: false }],
			activeStationId: 'station-selected'
		});

		expect(screen.getByRole('option', { name: 'Stasiun Arsip (nonaktif)' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Stasiun Utama' })).toBeInTheDocument();
	});

	it('shows the read-only scope notice after selecting a disabled station', async () => {
		let activeContextBody: unknown;
		const scopedSession = { ...superadminSession, active_context: { org_id: 'org-selected', station_id: 'station-selected' } };
		server.use(http.post(`${apiUrl}/session/active-context`, async ({ request }) => {
			activeContextBody = await request.json();
			scopedSession.active_context = { org_id: 'org-selected', station_id: 'station-arsip' };
			return HttpResponse.json({ active_context: scopedSession.active_context });
		}));
		render(StationSwitcher, {
			session: scopedSession,
			stations: [...stations, { id: 'station-arsip', name: 'Stasiun Arsip', enabled: false }],
			activeStationId: 'station-selected'
		});

		await fireEvent.change(screen.getByRole('combobox', { name: 'Stasiun aktif' }), { target: { value: 'station-arsip' } });

		await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Mode baca'));
		expect(activeContextBody).toEqual({ org_id: 'org-selected', station_id: 'station-arsip' });
		expect(screen.getByRole('combobox', { name: 'Stasiun aktif' })).toHaveValue('station-arsip');
	});

	it('does not show the read-only notice for an enabled station', async () => {
		server.use(http.post(`${apiUrl}/session/active-context`, () =>
			HttpResponse.json({ active_context: { org_id: 'org-selected', station_id: 'station-other' } })
		));
		render(StationSwitcher, options(superadminSession));

		await fireEvent.change(screen.getByRole('combobox', { name: 'Stasiun aktif' }), { target: { value: 'station-other' } });

		await waitFor(() => expect(navigation.invalidateAll).toHaveBeenCalled());
		expect(screen.queryByRole('status')).not.toBeInTheDocument();
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

	it('still switches by cookie on shift pages without the unsaved-edits confirm', async () => {
		window.history.replaceState({}, '', '/shift/shift-1');
		const confirm = vi.spyOn(window, 'confirm');
		render(StationSwitcher, { session: supervisorSession, stations, activeStationId: 'station-selected' });

		await fireEvent.change(screen.getByRole('combobox', { name: 'Stasiun aktif' }), { target: { value: 'station-other' } });

		await waitFor(() => expect(navigation.invalidateAll).toHaveBeenCalled());
		expect(confirm).not.toHaveBeenCalled();
		expect(document.cookie).toContain('pomkita_active_station=station-other');
	});
});
