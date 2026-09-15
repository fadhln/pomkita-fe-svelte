import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { apiUrl } from '../../../../test/mocks/handlers';
import { server } from '../../../../test/mocks/server';
import { load } from './+page';

describe('pengguna page load', () => {
	it('loads users for Owner without widening the request', async () => {
		let requestUrl = '';
		server.use(http.get(`${apiUrl}/users`, ({ request }) => {
			requestUrl = request.url;
			return HttpResponse.json([]);
		}));

		await expect(load({ parent: async () => ({ session: { org_id: 'org-owner', station_ids: ['station-1'], roles: ['Owner'] } }), url: new URL('http://localhost/pengaturan/pengguna') } as never)).resolves.toMatchObject({
			users: [], isOwner: true, isSuperadmin: false, authorized: true, stationIds: ['station-1']
		});
		expect(requestUrl).toBe('http://localhost:8080/api/v1/users');
	});

	it('sends org_id for Superadmin', async () => {
		let requestUrl = '';
		server.use(http.get(`${apiUrl}/users`, ({ request }) => {
			requestUrl = request.url;
			return HttpResponse.json([]);
		}));

		await load({ parent: async () => ({ session: { org_id: 'org-session', station_ids: [], roles: ['Superadmin'] } }), url: new URL('http://localhost/pengaturan/pengguna?org_id=org-selected') } as never);
		expect(requestUrl).toBe('http://localhost:8080/api/v1/users?org_id=org-selected');
	});

	it('does not send a request for an actor without access', async () => {
		let calls = 0;
		server.use(http.get(`${apiUrl}/users`, () => { calls += 1; return HttpResponse.json([]); }));

		await expect(load({ parent: async () => ({ session: { org_id: 'org-1', roles: ['Supervisor'] } }), url: new URL('http://localhost/pengaturan/pengguna') } as never)).resolves.toMatchObject({ users: [], authorized: false });
		expect(calls).toBe(0);
	});
});
