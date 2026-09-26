import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiUrl } from '../../../test/mocks/handlers';
import { server } from '../../../test/mocks/server';
import OrganizationSwitcher from './OrganizationSwitcher.svelte';

const navigation = vi.hoisted(() => ({ invalidateAll: vi.fn().mockResolvedValue(undefined) }));
vi.mock('$app/navigation', () => navigation);

const organizations = [
	{ id: 'org-z', name: 'Zulu', enabled: true },
	{ id: 'org-off', name: 'Disabled', enabled: false },
	{ id: 'org-a', name: 'Alpha', enabled: true }
] as never;

const session = { roles: ['Superadmin'], org_id: 'org-z', active_context: null };

afterEach(() => vi.clearAllMocks());

describe('OrganizationSwitcher', () => {
	it('is hidden for non-superadmins', () => {
		render(OrganizationSwitcher, { session: { ...session, roles: ['Owner'] }, organizations });
		expect(screen.queryByRole('combobox', { name: 'Organisasi aktif' })).not.toBeInTheDocument();
	});

	it('lists enabled organizations in name order for superadmins', () => {
		render(OrganizationSwitcher, { session, organizations });
		const options = screen.getAllByRole('option').map((option) => option.textContent);
		expect(options).toEqual(['Alpha', 'Zulu']);
		expect(screen.getByRole('combobox', { name: 'Organisasi aktif' })).toHaveValue('org-z');
	});

	it('sets the selected organization with its first enabled station and reloads the route', async () => {
		let activeContextBody: unknown;
		let stationOrgId: string | null = null;
		server.use(
			http.get(`${apiUrl}/stations`, ({ request }) => {
				stationOrgId = new URL(request.url).searchParams.get('org_id');
				return HttpResponse.json([
					{ station_id: 'disabled', name: 'Disabled', enabled: false },
					{ station_id: 'station-first', name: 'First', enabled: true },
					{ station_id: 'station-second', name: 'Second', enabled: true }
				]);
			}),
			http.post(`${apiUrl}/session/active-context`, async ({ request }) => {
				activeContextBody = await request.json();
				return HttpResponse.json({ active_context: { org_id: 'org-a', station_id: 'station-first' } });
			})
		);
		render(OrganizationSwitcher, { session, organizations });

		await fireEvent.change(screen.getByRole('combobox', { name: 'Organisasi aktif' }), { target: { value: 'org-a' } });

		await waitFor(() => expect(navigation.invalidateAll).toHaveBeenCalled());
		expect(stationOrgId).toBe('org-a');
		expect(activeContextBody).toEqual({ org_id: 'org-a', station_id: 'station-first' });
	});
});
