import { http, HttpResponse, type RequestHandler } from 'msw';

export const apiUrl = 'http://localhost:8080';

export const sessionFixture = {
	user_id: '11111111-1111-4111-8111-111111111111',
	display_name: 'Test User',
	roles: ['Supervisor'],
	org_id: '22222222-2222-4222-8222-222222222222',
	station_id: '33333333-3333-4333-8333-333333333333'
} as const;

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
];
