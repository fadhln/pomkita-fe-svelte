import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { apiUrl } from '../../../test/mocks/handlers';
import { server } from '../../../test/mocks/server';
import { load } from './+page';

describe('policy load', () => {
	it('loads policy history for the session station', async () => {
		server.use(http.get(`${apiUrl}/policies/history`, ({ request }) => { expect(new URL(request.url).searchParams.get('station_id')).toBe('station-1'); return HttpResponse.json([]); }));
		await expect(load({ parent: async () => ({ session: { station_ids: ['station-1'] } }) } as never)).resolves.toEqual({ revisions: [], stationId: 'station-1' });
	});
});
