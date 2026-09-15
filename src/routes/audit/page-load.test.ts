import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { apiUrl } from '../../../test/mocks/handlers';
import { server } from '../../../test/mocks/server';
import { load } from './+page';

describe('audit load', () => {
	it('loads rows and chain verification', async () => {
		server.use(http.get(`${apiUrl}/audit`, () => HttpResponse.json([])), http.get(`${apiUrl}/audit/verify`, () => HttpResponse.json({ verified: true })));
		await expect(load({} as never)).resolves.toEqual({ rows: [], verification: { verified: true } });
	});
});
