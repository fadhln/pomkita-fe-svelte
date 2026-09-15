import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it } from 'vitest';
import { apiUrl } from '../../../test/mocks/handlers';
import { server } from '../../../test/mocks/server';
import { clearActiveStationCookie, setActiveStationCookie } from '$lib/station/active';
import { load } from './+page';

afterEach(() => clearActiveStationCookie());

describe('shift list load', () => {
	it('loads shifts and station from the parent session', async () => {
		await expect(load({ parent: async () => ({ session: { station_ids: ['station-1'] } }) } as never)).resolves.toEqual({ shifts: expect.any(Array), stationId: 'station-1' });
	});

	it('falls back to the first permitted station when the cookie is unknown', async () => {
		setActiveStationCookie('station-removed');
		server.use(http.get(`${apiUrl}/shifts`, ({ request }) => {
			expect(new URL(request.url).searchParams.get('station_id')).toBe('station-1');
			return HttpResponse.json([]);
		}));

		await load({ parent: async () => ({ session: { station_ids: ['station-1', 'station-2'] } }) } as never);
		expect(document.cookie).toContain('pomkita_active_station=station-1');
	});

	it('uses the permitted station in the cookie', async () => {
		setActiveStationCookie('station-2');
		server.use(http.get(`${apiUrl}/shifts`, ({ request }) => {
			expect(new URL(request.url).searchParams.get('station_id')).toBe('station-2');
			return HttpResponse.json([]);
		}));

		await load({ parent: async () => ({ session: { station_ids: ['station-1', 'station-2'] } }) } as never);
	});
});
