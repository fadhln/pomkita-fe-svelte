import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiFetch } from '$lib/api/client';
import { apiUrl } from '../../../test/mocks/handlers';
import { server } from '../../../test/mocks/server';
import { installSessionExpiryRedirect } from './guard';

const navigation = vi.hoisted(() => ({ goto: vi.fn().mockResolvedValue(undefined) }));

vi.mock('$app/navigation', () => navigation);

afterEach(() => vi.clearAllMocks());

describe('session expiry redirect', () => {
	it('redirects to Masuk after session_idle', async () => {
		const cleanup = installSessionExpiryRedirect();
		server.use(
			http.get(`${apiUrl}/session`, () =>
				HttpResponse.json({ type: 'https://example.com/problems/session-idle', title: 'Unauthorized', status: 401, detail: 'Sesi tidak aktif.' }, { status: 401 })
			)
		);

		await expect(apiFetch('/session')).rejects.toMatchObject({ body: { code: 'session_idle', problem: { type: 'https://example.com/problems/session-idle' } } });
		expect(navigation.goto).toHaveBeenCalledWith('/masuk');
		cleanup();
	});
});
