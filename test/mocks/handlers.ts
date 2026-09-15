import { http, HttpResponse, type RequestHandler } from 'msw';
import type { Account } from '../../src/features/account/api';

export const apiUrl = 'http://localhost:8080/api/v1';
export const sessionFixture = {
	user_id: '11111111-1111-4111-8111-111111111111', username: 'test.user', display_name: 'Test User', roles: ['Supervisor'],
	org_id: '22222222-2222-4222-8222-222222222222', station_ids: ['33333333-3333-4333-8333-333333333333']
} as const;
export const secondStationFixture = {
	id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', name: 'Stasiun Timur', code: 'TMR', address: 'Jakarta Timur', timezone: 'Asia/Jakarta', enabled: true
} as const;
export const twoStationSessionFixture = {
	...sessionFixture, station_ids: [sessionFixture.station_ids[0], secondStationFixture.id]
} as const;
export const accountFixture: Account = {
	user_id: sessionFixture.user_id,
	email: 'budi@example.com',
	username: sessionFixture.username,
	display_name: sessionFixture.display_name,
	org: { id: sessionFixture.org_id, name: 'Organisasi PomKita' },
	roles: ['Supervisor'],
	stations: [sessionFixture.station_ids[0]]
};
export const shiftFixture = {
	shift_id: '44444444-4444-4444-8444-444444444444', station_id: sessionFixture.station_ids[0], station_seq: 18,
	supervisor_id: sessionFixture.user_id, opened_at: '2026-09-13T08:00:00Z', business_date: '2026-09-13', status: 'open'
} as const;
export const shiftDetailFixture = { ...shiftFixture, draft_id: '55555555-5555-4555-8555-555555555555', revision: 2 } as const;
export const reportFixture = { report_id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', station_id: shiftFixture.station_id, shift_id: shiftFixture.shift_id, version_no: 1, status: 'submitted', submitted_at: '2026-09-13T09:00:00Z', readings: [], sales: [], losses: [] } as const;
export const openedShiftFixture = {
	...shiftFixture, org_id: sessionFixture.org_id, timezone_snapshot: 'Asia/Jakarta'
} as const;
export const draftFixture = {
	station_id: shiftFixture.station_id, draft_id: shiftDetailFixture.draft_id, shift_id: shiftFixture.shift_id,
	status: 'editing', revision: shiftDetailFixture.revision, readings: [], sales: [], losses: []
} as const;
export const organizationFixture = {
	id: sessionFixture.org_id, name: 'Organisasi PomKita', legal_name: 'PT PomKita Operasional', address: 'Jakarta', contact_email: 'admin@pomkita.id', timezone: 'Asia/Jakarta', enabled: true
};
export const stationFixture = {
	id: sessionFixture.station_ids[0], name: 'Stasiun Utama', code: 'UTM', address: 'Jakarta', timezone: 'Asia/Jakarta', enabled: true
};
export const userFixture = {
	id: '77777777-7777-4777-8777-777777777777', email: 'operator@example.com', display_name: 'Operator PomKita', username: 'operator', enabled: true,
	roles: [{ role: 'Operator', station_id: stationFixture.id, station_name: stationFixture.name }]
};
export const userDetailFixture = { ...userFixture, stations: [{ id: stationFixture.id, name: stationFixture.name }] };

const submitRequests = new Map<string, string>();
export function resetShiftFixtures() { submitRequests.clear(); }
export function resetAccountFixtures() {
	accountFixture.username = sessionFixture.username;
	accountFixture.display_name = sessionFixture.display_name;
}
const validCredentials = { username: 'test.user', password: 'correct-password' };
const problem = (type: string, title: string, status: number, detail: string) => ({ type, title, status, detail });

export const handlers: RequestHandler[] = [
	http.post(`${apiUrl}/login`, async ({ request }) => {
		const credentials = (await request.json().catch(() => undefined)) as Partial<typeof validCredentials> | undefined;
		if (credentials?.username !== validCredentials.username || credentials.password !== validCredentials.password) {
			return HttpResponse.json(problem('https://example.com/problems/invalid-credentials', 'Unauthorized', 401, 'Nama pengguna atau kata sandi salah.'), { status: 401 });
		}
		return new HttpResponse(null, { status: 204, headers: { 'Set-Cookie': 'pomkita_session=test-jwt; HttpOnly; SameSite=Lax; Path=/; Max-Age=900' } });
	}),
	http.delete(`${apiUrl}/logout`, () => new HttpResponse(null, { status: 204 })),
	http.get(`${apiUrl}/session`, () => HttpResponse.json(sessionFixture, { status: 200 })),
	http.get(`${apiUrl}/account`, () => HttpResponse.json(accountFixture, { status: 200 })),
	http.get(`${apiUrl}/users`, () => HttpResponse.json([userFixture], { status: 200 })),
	http.post(`${apiUrl}/users`, async ({ request }) => HttpResponse.json({ ...userDetailFixture, ...(await request.json() as Record<string, unknown>), id: 'user-created' }, { status: 201 })),
	http.get(`${apiUrl}/users/${userFixture.id}`, () => HttpResponse.json(userDetailFixture, { status: 200 })),
	http.patch(`${apiUrl}/users/${userFixture.id}`, async ({ request }) => HttpResponse.json({ ...userDetailFixture, ...(await request.json() as Record<string, unknown>) }, { status: 200 })),
	http.post(`${apiUrl}/users/${userFixture.id}/roles`, () => HttpResponse.json(userDetailFixture.roles, { status: 200 })),
	http.delete(`${apiUrl}/users/${userFixture.id}/roles`, () => new HttpResponse(null, { status: 204 })),
	http.get(`${apiUrl}/users/${userFixture.id}/role-history`, () => HttpResponse.json([], { status: 200 })),
	http.post(`${apiUrl}/users/${userFixture.id}/password-reset`, () => HttpResponse.json({ link: 'https://example.test/reset/fixture-token' }, { status: 200 })),
	http.get(`${apiUrl}/organizations`, () => HttpResponse.json([organizationFixture], { status: 200 })),
	http.get(`${apiUrl}/organizations/${organizationFixture.id}`, () => HttpResponse.json(organizationFixture, { status: 200 })),
	http.post(`${apiUrl}/organizations`, async ({ request }) => HttpResponse.json({ ...organizationFixture, ...(await request.json() as Record<string, unknown>), id: 'org-created' }, { status: 201 })),
	http.patch(`${apiUrl}/organizations/${organizationFixture.id}`, async ({ request }) => HttpResponse.json({ ...organizationFixture, ...(await request.json() as Record<string, unknown>) }, { status: 200 })),
	http.post(`${apiUrl}/organizations/${organizationFixture.id}/disable`, () => new HttpResponse(null, { status: 204 })),
	http.get(`${apiUrl}/stations`, () => HttpResponse.json([stationFixture, secondStationFixture], { status: 200 })),
	http.get(`${apiUrl}/stations/${stationFixture.id}`, () => HttpResponse.json(stationFixture, { status: 200 })),
	http.post(`${apiUrl}/stations`, async ({ request }) => HttpResponse.json({ ...stationFixture, ...(await request.json() as Record<string, unknown>), id: 'station-created' }, { status: 201 })),
	http.patch(`${apiUrl}/stations/${stationFixture.id}`, async ({ request }) => HttpResponse.json({ ...stationFixture, ...(await request.json() as Record<string, unknown>) }, { status: 200 })),
	http.post(`${apiUrl}/stations/${stationFixture.id}/disable`, () => new HttpResponse(null, { status: 204 })),
	http.patch(`${apiUrl}/account`, async ({ request }) => {
		const input = await request.json() as { display_name: string; username: string };
		accountFixture.display_name = input.display_name;
		accountFixture.username = input.username;
		return HttpResponse.json(accountFixture, { status: 200 });
	}),
	http.post(`${apiUrl}/account/password`, () => new HttpResponse(null, { status: 204 })),
	http.post(`${apiUrl}/auth/password/forgot`, () => new HttpResponse(null, { status: 202 })),
	http.post(`${apiUrl}/auth/password/reset`, () => new HttpResponse(null, { status: 204 })),
	http.get(`${apiUrl}/shifts`, () => HttpResponse.json([shiftFixture], { status: 200 })),
	http.post(`${apiUrl}/shifts`, () => HttpResponse.json(openedShiftFixture, { status: 200 })),
	http.get(`${apiUrl}/shifts/${shiftFixture.shift_id}`, () => HttpResponse.json(shiftDetailFixture, { status: 200 })),
	http.get(`${apiUrl}/reports/${reportFixture.report_id}`, () => HttpResponse.json(reportFixture, { status: 200 })),
	http.get(`${apiUrl}/reports/${reportFixture.report_id}/printout`, () => HttpResponse.json(reportFixture, { status: 200 })),
	http.get(`${apiUrl}/policies/history`, () => HttpResponse.json([], { status: 200 })),
	http.post(`${apiUrl}/drafts/claim`, () => HttpResponse.json({ draft_id: shiftDetailFixture.draft_id, claim_token: '66666666-6666-4666-8666-666666666666', claim_expires_at: '2026-09-13T09:00:00Z', revision: shiftDetailFixture.revision })),
	http.post(`${apiUrl}/drafts/heartbeat`, () => new HttpResponse(null, { status: 204 })),
	http.post(`${apiUrl}/drafts/readings`, () => HttpResponse.json({ revision: 3 })),
	http.post(`${apiUrl}/drafts/sales`, () => HttpResponse.json({ revision: 4 })),
	http.post(`${apiUrl}/drafts/losses`, () => HttpResponse.json({ revision: 5 })),
	http.post(`${apiUrl}/drafts/evidence`, () => HttpResponse.json({ revision: 6 })),
	http.post(`${apiUrl}/submissions`, async ({ request }) => {
		const key = request.headers.get('Idempotency-Key') ?? '';
		const body = JSON.stringify(await request.json());
		const previous = submitRequests.get(key);
		if (previous && previous !== body) return HttpResponse.json(problem('https://example.com/problems/conflict', 'Conflict', 409, 'Idempotency key digunakan dengan payload berbeda.'), { status: 409 });
		if (previous) return HttpResponse.json({ report_id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', replay: true, request_hash: 'cmVwbGF5' });
		submitRequests.set(key, body);
		return HttpResponse.json({ report_id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', replay: false, request_hash: 'cmVxdWVzdA' });
	})
];
