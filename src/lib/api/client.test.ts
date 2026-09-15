import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiFetch, apiFetchText, setSessionExpiredHandler } from './client';

describe('apiFetch', () => {
	afterEach(() => {
		setSessionExpiredHandler(undefined);
		vi.unstubAllGlobals();
	});

	it.each([
		[401, 'invalid_credentials', 'https://example.com/problems/invalid-credentials'],
		[401, 'invalid_session', 'https://example.com/problems/unauthorized'],
		[401, 'session_idle', 'https://example.com/problems/session-idle'],
		[403, 'forbidden', 'https://example.com/problems/forbidden'],
		[404, 'not_found', 'https://example.com/problems/not-found'],
		[409, 'conflict', 'https://example.com/problems/conflict'],
		[422, 'validation', 'https://example.com/problems/validation']
	] as const)('maps problem details to stable code %s', async (status, code, type) => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue(
				new Response(JSON.stringify({ type, title: 'Permintaan gagal.', status, detail: 'Detail masalah.', errors: [{ location: 'body.email', message: 'Tidak valid.' }] }), {
					status,
					headers: { 'Content-Type': 'application/problem+json' }
				})
			)
		);

		await expect(apiFetch('/session')).rejects.toMatchObject({
			status,
			body: { code, message: 'Detail masalah.', problem: { type, title: 'Permintaan gagal.', errors: [{ location: 'body.email', message: 'Tidak valid.' }] }, field_errors: { 'body.email': 'Tidak valid.' } }
		});
	});

	it('sends credentials, request ID, and CSRF header for mutations', async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(null, { status: 204, headers: { 'X-Request-ID': 'response-request-1' } })
		);
		vi.stubGlobal('fetch', fetchMock);

		await expect(apiFetch<void>('/logout', { method: 'DELETE' })).resolves.toBeUndefined();

		const request = fetchMock.mock.calls[0][1] as RequestInit;
		const headers = new Headers(request.headers);
		expect(request.credentials).toBe('include');
		expect(headers.get('X-Requested-With')).toBe('XMLHttpRequest');
		expect(headers.get('X-Request-ID')).toBeTruthy();
		expect(headers.get('Accept')).toBe('application/json');
	});

	it('uses the response request ID when an error body does not include one', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue(
				new Response(JSON.stringify({ type: 'https://example.com/problems/internal', title: 'Internal Server Error', detail: 'Gagal.' }), {
					status: 500,
					headers: { 'X-Request-ID': 'response-request-2' }
				})
			)
		);

		await expect(apiFetch('/session')).rejects.toMatchObject({
			body: { code: 'unexpected', message: 'Gagal.', request_id: 'response-request-2' },
			requestId: 'response-request-2'
		});
	});

	it('preserves decimal strings in a successful response', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue(
				new Response(JSON.stringify({ liters: '999999999999999999.123456' }), { status: 200 })
			)
		);

		await expect(apiFetch<{ liters: string }>('/report')).resolves.toEqual({
			liters: '999999999999999999.123456'
		});
	});

	it('keeps CSV mutation requests free of a JSON content type', async () => {
		const fetchMock = vi.fn().mockResolvedValue(new Response('laporan,csv', { status: 200 }));
		vi.stubGlobal('fetch', fetchMock);

		await expect(apiFetchText('/report.csv', { method: 'POST', body: 'filter' })).resolves.toBe('laporan,csv');

		const headers = new Headers((fetchMock.mock.calls[0][1] as RequestInit).headers);
		expect(headers.get('Accept')).toBe('text/csv');
		expect(headers.get('Content-Type')).toBeNull();
		expect(headers.get('X-Requested-With')).toBe('XMLHttpRequest');
	});

	it('notifies the session expiry handler for idle and invalid sessions', async () => {
		const expired = vi.fn();
		setSessionExpiredHandler(expired);
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue(
				new Response(JSON.stringify({ type: 'https://example.com/problems/session-idle', title: 'Unauthorized', detail: 'Sesi tidak aktif.' }), { status: 401 })
			)
		);

		await expect(apiFetch('/session')).rejects.toBeInstanceOf(ApiError);
		expect(expired).toHaveBeenCalledWith(
			expect.objectContaining({ body: expect.objectContaining({ code: 'session_idle', problem: expect.objectContaining({ type: 'https://example.com/problems/session-idle' }) }) })
		);
	});
});
