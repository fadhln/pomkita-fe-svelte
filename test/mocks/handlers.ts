import { http, HttpResponse, type RequestHandler } from 'msw';

export const apiUrl = 'http://localhost:8080';

export const sessionFixture = {
	user_id: '11111111-1111-4111-8111-111111111111',
	display_name: 'Test User',
	roles: ['Supervisor'],
	org_id: '22222222-2222-4222-8222-222222222222',
	station_id: '33333333-3333-4333-8333-333333333333'
} as const;

export const shiftFixture = {
	shift_id: '44444444-4444-4444-8444-444444444444',
	station_id: sessionFixture.station_id,
	station_seq: '18',
	business_date: '2026-09-13',
	status: 'open',
	current_report_id: null
} as const;

export const draftFixture = {
	draft_id: '55555555-5555-4555-8555-555555555555',
	shift_id: shiftFixture.shift_id,
	status: 'editing',
	revision: 2,
	readings: [],
	sales: [],
	losses: []
} as const;

const submitRequests = new Map<string, string>();
export function resetShiftFixtures() {
	submitRequests.clear();
}

const validCredentials = { email: 'user@example.com', password: 'correct-password' };

export const handlers: RequestHandler[] = [
	http.post(`${apiUrl}/login`, async ({ request }) => {
		const body = await request.json().catch(() => undefined);
		const credentials = body as Partial<typeof validCredentials> | undefined;
		if (credentials?.email !== validCredentials.email || credentials.password !== validCredentials.password) {
			return HttpResponse.json({ code: 'invalid_credentials', message: 'Invalid credentials' }, { status: 401 });
		}
		return new HttpResponse(null, {
			status: 200,
			headers: {
				'Set-Cookie': 'pomkita_session=test-jwt; HttpOnly; SameSite=Lax; Path=/; Max-Age=900'
			}
		});
	}),
	http.delete(`${apiUrl}/logout`, () => new HttpResponse(null, { status: 204 })),
	http.get(`${apiUrl}/session`, () => HttpResponse.json(sessionFixture, { status: 200 }))
	,
	http.get(`${apiUrl}/shifts`, () => HttpResponse.json([shiftFixture], { status: 200 })),
	http.post(`${apiUrl}/shift/open`, async ({ request }) => {
		const body = (await request.json()) as { station_id?: string };
		return HttpResponse.json({ shift_id: body.station_id === sessionFixture.station_id ? shiftFixture.shift_id : 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' });
	}),
	http.get(`${apiUrl}/draft`, () => HttpResponse.json(draftFixture, { status: 200 })),
	http.post(`${apiUrl}/draft/claim`, () => HttpResponse.json({ draft_id: draftFixture.draft_id, claim_token: '66666666-6666-4666-8666-666666666666', revision: draftFixture.revision })),
	http.post(`${apiUrl}/draft/heartbeat`, () => HttpResponse.json({ renewed: true })),
	http.post(`${apiUrl}/draft/reading`, () => HttpResponse.json({ revision: 3 })),
	http.post(`${apiUrl}/draft/sales`, () => HttpResponse.json({ revision: 3 })),
	http.post(`${apiUrl}/draft/loss`, () => HttpResponse.json({ revision: 3 })),
	http.post(`${apiUrl}/draft/evidence`, () => HttpResponse.json({ revision: 3 })),
	http.post(`${apiUrl}/shift/submit`, async ({ request }) => {
		const key = request.headers.get('Idempotency-Key') ?? '';
		const body = JSON.stringify(await request.json());
		const previous = submitRequests.get(key);
		if (previous && previous !== body) return HttpResponse.json({ code: 'conflict', message: 'Idempotency key digunakan dengan payload berbeda.' }, { status: 409 });
		if (previous) return HttpResponse.json({ report_id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', replay: true });
		submitRequests.set(key, body);
		return HttpResponse.json({ report_id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', replay: false });
	})
];
