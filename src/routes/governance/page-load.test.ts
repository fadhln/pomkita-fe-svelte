import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { apiUrl } from '../../../test/mocks/handlers';
import { server } from '../../../test/mocks/server';
import { load } from './+page';

describe('governance load', () => {
	it('loads amendments and awaiting reports for the first station', async () => {
		server.use(
			http.get(`${apiUrl}/amendments`, () => HttpResponse.json([])),
			http.get(`${apiUrl}/shifts`, ({ request }) => {
				expect(new URL(request.url).searchParams.get('station_id')).toBe('station-1');
				return HttpResponse.json([]);
			})
		);

		await expect(load({ parent: async () => ({ session: { station_ids: ['station-1'] } }) } as never)).resolves.toMatchObject({ amendments: [], shifts: [] });
	});
});
