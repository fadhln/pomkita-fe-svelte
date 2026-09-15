import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { apiUrl } from '../../../test/mocks/handlers';
import { server } from '../../../test/mocks/server';
import { load } from './+page';

const organization = { id: 'org-1', name: 'PomKita', legal_name: 'PT PomKita', address: 'Jakarta', contact_email: 'admin@pomkita.id', timezone: 'Asia/Jakarta', enabled: true };

describe('organisasi load', () => {
	it('loads organizations and details for an authorized owner', async () => {
		let listCalls = 0;
		let detailCalls = 0;
		server.use(
			http.get(`${apiUrl}/organizations`, () => { listCalls += 1; return HttpResponse.json([organization]); }),
			http.get(`${apiUrl}/organizations/org-1`, () => { detailCalls += 1; return HttpResponse.json(organization); })
		);

		await expect(load({ parent: async () => ({ session: { roles: ['Owner'] } }) } as never)).resolves.toMatchObject({ organizations: [organization], isOwner: true, isSuperadmin: false });
		expect(listCalls).toBe(1);
		expect(detailCalls).toBe(1);
	});

	it('does not send a request for a role without organization access', async () => {
		let calls = 0;
		server.use(http.get(`${apiUrl}/organizations`, () => { calls += 1; return HttpResponse.json([]); }));

		await expect(load({ parent: async () => ({ session: { roles: ['Supervisor'] } }) } as never)).resolves.toEqual({ organizations: [], isOwner: false, isSuperadmin: false, authorized: false });
		expect(calls).toBe(0);
	});
});
