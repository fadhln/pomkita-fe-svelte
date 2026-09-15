import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { apiUrl } from '../../../test/mocks/handlers';
import { server } from '../../../test/mocks/server';
import { changePassword, getAccount, updateAccount } from './api';

describe('account API', () => {
	it('reads the account contract', async () => {
		await expect(getAccount()).resolves.toEqual(expect.objectContaining({
			user_id: expect.any(String),
			email: expect.any(String),
			username: expect.any(String),
			display_name: expect.any(String),
			org: { id: expect.any(String), name: expect.any(String) },
			roles: expect.any(Array),
			stations: expect.any(Array)
		}));
	});

	it('patches the display name and username', async () => {
		let body: unknown;
		server.use(http.patch(`${apiUrl}/account`, async ({ request }) => {
			body = await request.json();
			return HttpResponse.json({ display_name: 'Budi Baru', username: 'budi.baru' });
		}));

		await expect(updateAccount({ display_name: 'Budi Baru', username: 'budi.baru' })).resolves.toEqual({ display_name: 'Budi Baru', username: 'budi.baru' });
		expect(body).toEqual({ display_name: 'Budi Baru', username: 'budi.baru' });
	});

	it('posts both passwords and accepts a 204 response', async () => {
		let body: unknown;
		server.use(http.post(`${apiUrl}/account/password`, async ({ request }) => {
			body = await request.json();
			return new HttpResponse(null, { status: 204 });
		}));

		await expect(changePassword({ current_password: 'old-password', new_password: 'new-password' })).resolves.toBeUndefined();
		expect(body).toEqual({ current_password: 'old-password', new_password: 'new-password' });
	});
});
