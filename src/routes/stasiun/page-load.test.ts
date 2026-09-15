import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { apiUrl } from '../../../test/mocks/handlers';
import { server } from '../../../test/mocks/server';
import { load } from './+page';

describe('stasiun load', () => {
	it('loads station details for an owner', async () => {
		const station = { id: 'station-1', name: 'Kebayoran', code: 'KBY', address: 'Jakarta', timezone: 'Asia/Jakarta', enabled: true };
		server.use(
			http.get(`${apiUrl}/stations`, () => HttpResponse.json([station])),
			http.get(`${apiUrl}/stations/station-1`, () => HttpResponse.json(station))
		);

		await expect(load({ parent: async () => ({ session: { roles: ['Owner'] } }) } as never)).resolves.toMatchObject({ stations: [station], isOwner: true });
	});

	it('does not send a request for an unavailable role', async () => {
		let calls = 0;
		server.use(http.get(`${apiUrl}/stations`, () => { calls += 1; return HttpResponse.json([]); }));

		await expect(load({ parent: async () => ({ session: { roles: ['Operator'] } }) } as never)).resolves.toEqual({ stations: [], isOwner: false, isSuperadmin: false, authorized: false });
		expect(calls).toBe(0);
	});
});
