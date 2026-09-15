import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { apiUrl } from '../../../test/mocks/handlers';
import { server } from '../../../test/mocks/server';
import { createStation, disableStation, getStation, getStations, updateStation } from './api';

describe('station api', () => {
	it('uses the S9 station contract for reads and mutations', async () => {
		let createBody: unknown;
		let updateBody: unknown;
		server.use(
			http.get(`${apiUrl}/stations`, () => HttpResponse.json([{ station_id: 'station-1', name: 'Kebayoran', code: 'KBY', address: 'Jakarta', timezone: 'Asia/Jakarta', enabled: true }])),
			http.get(`${apiUrl}/stations/station-1`, () => HttpResponse.json({ station_id: 'station-1', name: 'Kebayoran', code: 'KBY', address: 'Jakarta', timezone: 'Asia/Jakarta', enabled: true })),
			http.post(`${apiUrl}/stations`, async ({ request }) => { createBody = await request.json(); return HttpResponse.json({ station_id: 'station-2' }, { status: 201 }); }),
			http.patch(`${apiUrl}/stations/station-1`, async ({ request }) => { updateBody = await request.json(); return HttpResponse.json({ station_id: 'station-1' }); }),
			http.post(`${apiUrl}/stations/station-1/disable`, () => new HttpResponse(null, { status: 204 }))
		);

		expect((await getStations())[0].id).toBe('station-1');
		expect((await getStation('station-1')).id).toBe('station-1');
		expect((await createStation({ name: 'Cilandak', code: 'CLD', address: 'Jakarta Selatan', timezone: 'Asia/Jakarta' })).id).toBe('station-2');
		expect((await updateStation('station-1', { name: 'Kebayoran Baru', code: 'KBY', address: 'Jakarta', timezone: 'Asia/Makassar', enabled: false })).id).toBe('station-1');
		await disableStation('station-1');

		expect(createBody).toEqual({ name: 'Cilandak', code: 'CLD', address: 'Jakarta Selatan', timezone: 'Asia/Jakarta' });
		expect(updateBody).toEqual({ name: 'Kebayoran Baru', code: 'KBY', address: 'Jakarta', timezone: 'Asia/Makassar', enabled: false });
	});

	it('keeps the id fixture fallback when station_id is absent', async () => {
		server.use(http.get(`${apiUrl}/stations/station-legacy`, () => HttpResponse.json({ id: 'station-legacy' })));

		expect((await getStation('station-legacy')).id).toBe('station-legacy');
	});
});
