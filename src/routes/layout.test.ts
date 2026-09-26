import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { apiUrl } from '../../test/mocks/handlers';
import { server } from '../../test/mocks/server';
import { load } from './+layout';

describe('root layout load', () => {
	it('does not request a session on the Masuk route', async () => {
		await expect(load({ route: { id: '/masuk' } } as never)).resolves.toEqual({
			isLogin: true,
			session: null
		});
	});

	it('does not request a session on the Aktivasi route', async () => {
		await expect(load({ route: { id: '/aktivasi' } } as never)).resolves.toEqual({
			isLogin: true,
			session: null
		});
	});

	it.each(['/lupa-sandi', '/reset-sandi'])('does not request a session on the %s route', async (route) => {
		await expect(load({ route: { id: route } } as never)).resolves.toEqual({
			isLogin: true,
			session: null
		});
	});

	it('loads the current session for application routes', async () => {
		await expect(load({ route: { id: '/' } } as never)).resolves.toMatchObject({
			isLogin: false,
			session: { display_name: 'Test User' }
		});
	});

	it('uses the server-returned superadmin context after a layout reload', async () => {
		const contextSession = {
			user_id: 'user-superadmin', username: 'root', display_name: 'Root', roles: ['Superadmin'],
			org_id: 'org-original', station_ids: [],
			active_context: { org_id: 'org-selected', station_id: 'station-selected' }
		};
		server.use(
			http.get(`${apiUrl}/session`, () => HttpResponse.json(contextSession)),
			http.get(`${apiUrl}/stations`, ({ request }) => {
				expect(new URL(request.url).searchParams.get('org_id')).toBe('org-selected');
				return HttpResponse.json([{ station_id: 'station-selected', name: 'Scoped station', enabled: true }]);
			})
		);

		const result = await load({ route: { id: '/' } } as never);

		expect(result).toMatchObject({ session: contextSession, activeStationId: 'station-selected', stations: [{ id: 'station-selected', name: 'Scoped station' }] });
	});
});
