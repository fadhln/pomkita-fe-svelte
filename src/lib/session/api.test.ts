import { describe, expect, it } from 'vitest';
import { getSession, login, logout } from './api';

describe('session API', () => {
	it('reads the pinned session response', async () => {
		await expect(getSession()).resolves.toEqual({
			user_id: '11111111-1111-4111-8111-111111111111',
			username: 'test.user',
			display_name: 'Test User',
			roles: ['Supervisor'],
			org_id: '22222222-2222-4222-8222-222222222222',
			station_ids: ['33333333-3333-4333-8333-333333333333'],
			active_context: null
		});
	});

	it('accepts the pinned credentials and logs out with a 204', async () => {
		await expect(login({ username: 'test.user', password: 'correct-password' })).resolves.toBeUndefined();
		await expect(logout()).resolves.toBeUndefined();
	});

	it('rejects an unknown username with invalid_credentials', async () => {
		const request = login({ username: 'unknown.user', password: 'correct-password' });

		await expect(request).rejects.toMatchObject({
			status: 401,
			body: { code: 'invalid_credentials', problem: { type: 'https://example.com/problems/invalid-credentials' } }
		});
	});
});
