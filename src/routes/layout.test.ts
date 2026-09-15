import { describe, expect, it } from 'vitest';
import { load } from './+layout';

describe('root layout load', () => {
	it('does not request a session on the Masuk route', async () => {
		await expect(load({ route: { id: '/masuk' } } as never)).resolves.toEqual({
			isLogin: true,
			session: null
		});
	});

	it('does not request a session on the Aktivasi route', async () => {
		await expect(load({ route: { id: '/aktivasi' } } as never)).resolves.toEqual({
			isLogin: true,
			session: null
		});
	});

	it.each(['/lupa-sandi', '/reset-sandi'])('does not request a session on the %s route', async (route) => {
		await expect(load({ route: { id: route } } as never)).resolves.toEqual({
			isLogin: true,
			session: null
		});
	});

	it('loads the current session for application routes', async () => {
		await expect(load({ route: { id: '/' } } as never)).resolves.toMatchObject({
			isLogin: false,
			session: { display_name: 'Test User' }
		});
	});
});
