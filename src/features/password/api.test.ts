import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { apiUrl } from '../../../test/mocks/handlers';
import { server } from '../../../test/mocks/server';
import { forgotPassword, resetPassword } from './api';

describe('password API', () => {
	it('posts the forgot-password identifier and accepts 202', async () => {
		let body: unknown;
		server.use(http.post(`${apiUrl}/auth/password/forgot`, async ({ request }) => {
			body = await request.json();
			return new HttpResponse(null, { status: 202 });
		}));

		await expect(forgotPassword({ identifier: 'budi@example.com' })).resolves.toBeUndefined();
		expect(body).toEqual({ identifier: 'budi@example.com' });
	});

	it('posts the reset token and new password and accepts 204', async () => {
		let body: unknown;
		server.use(http.post(`${apiUrl}/auth/password/reset`, async ({ request }) => {
			body = await request.json();
			return new HttpResponse(null, { status: 204 });
		}));

		await expect(resetPassword({ token: 'reset-token', password: 'new-password' })).resolves.toBeUndefined();
		expect(body).toEqual({ token: 'reset-token', password: 'new-password' });
	});
});
