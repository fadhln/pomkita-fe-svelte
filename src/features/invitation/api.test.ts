import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { apiUrl } from '../../../test/mocks/handlers';
import { server } from '../../../test/mocks/server';
import { acceptInvitation } from './api';

describe('invitation API', () => {
	it('posts the activation contract and accepts a 204 response', async () => {
		let body: Record<string, unknown> | undefined;
		server.use(http.post(`${apiUrl}/auth/invitations/accept`, async ({ request }) => {
			body = await request.json() as Record<string, unknown>;
			return new HttpResponse(null, { status: 204 });
		}));

		await expect(acceptInvitation({ token: 'invite-token', username: 'budi.s', password: 'strong-password', display_name: 'Budi Santoso' })).resolves.toBeUndefined();
		expect(body).toEqual({ token: 'invite-token', username: 'budi.s', password: 'strong-password', display_name: 'Budi Santoso' });
	});
});
