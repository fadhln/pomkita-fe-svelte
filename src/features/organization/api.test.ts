import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { apiUrl } from '../../../test/mocks/handlers';
import { server } from '../../../test/mocks/server';
import { createOrganization, disableOrganization, getOrganization, getOrganizations, updateOrganization } from './api';

describe('organization api', () => {
	it('uses the S9 organization contract for reads and mutations', async () => {
		let createBody: unknown;
		let updateBody: unknown;
		server.use(
			http.get(`${apiUrl}/organizations`, () => HttpResponse.json([{ org_id: 'org-1', name: 'PomKita', legal_name: 'PT PomKita', address: 'Jakarta', contact_email: 'admin@pomkita.id', timezone: 'Asia/Jakarta', enabled: true }])),
			http.get(`${apiUrl}/organizations/org-1`, () => HttpResponse.json({ org_id: 'org-1', name: 'PomKita', legal_name: 'PT PomKita', address: 'Jakarta', contact_email: 'admin@pomkita.id', timezone: 'Asia/Jakarta', enabled: true })),
			http.post(`${apiUrl}/organizations`, async ({ request }) => { createBody = await request.json(); return HttpResponse.json({ org_id: 'org-2' }, { status: 201 }); }),
			http.patch(`${apiUrl}/organizations/org-1`, async ({ request }) => { updateBody = await request.json(); return HttpResponse.json({ org_id: 'org-1' }); }),
			http.post(`${apiUrl}/organizations/org-1/disable`, () => new HttpResponse(null, { status: 204 }))
		);

		expect((await getOrganizations())[0].id).toBe('org-1');
		expect((await getOrganization('org-1')).id).toBe('org-1');
		expect((await createOrganization({ name: 'Baru', legal_name: 'PT Baru', address: 'Bandung', contact_email: 'baru@pomkita.id', timezone: 'Asia/Makassar', first_station: { name: 'Stasiun A', timezone: 'Asia/Makassar' } })).id).toBe('org-2');
		expect((await updateOrganization('org-1', { name: 'Nama baru', legal_name: 'PT Baru', address: 'Surabaya', contact_email: 'kontak@pomkita.id', timezone: 'Asia/Jayapura', enabled: false })).id).toBe('org-1');
		await disableOrganization('org-1');

		expect(createBody).toEqual({ name: 'Baru', legal_name: 'PT Baru', address: 'Bandung', contact_email: 'baru@pomkita.id', timezone: 'Asia/Makassar', first_station: { name: 'Stasiun A', timezone: 'Asia/Makassar' } });
		expect(updateBody).toEqual({ name: 'Nama baru', legal_name: 'PT Baru', address: 'Surabaya', contact_email: 'kontak@pomkita.id', timezone: 'Asia/Jayapura', enabled: false });
	});
});
