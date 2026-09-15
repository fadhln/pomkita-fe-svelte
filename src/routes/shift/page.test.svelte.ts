import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiUrl } from '../../../test/mocks/handlers';
import { server } from '../../../test/mocks/server';
import Page from './+page.svelte';

const navigation = vi.hoisted(() => ({ goto: vi.fn().mockResolvedValue(undefined), invalidateAll: vi.fn().mockResolvedValue(undefined) }));
vi.mock('$app/navigation', () => navigation);

afterEach(() => vi.clearAllMocks());

describe('Shift', () => {
	it('lists shifts and opens a new shift for the current station', async () => {
		let body: Record<string, unknown> | undefined;
		server.use(http.post(`${apiUrl}/shifts`, async ({ request }) => {
			body = (await request.json()) as Record<string, unknown>;
			return HttpResponse.json({ shift_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' });
		}));
		render(Page, { data: { shifts: [], stationId: '33333333-3333-4333-8333-333333333333' } });

		expect(screen.getByRole('heading', { name: 'Shift' })).toBeInTheDocument();
		await fireEvent.input(screen.getByLabelText('Waktu buka (opsional)'), { target: { value: '2026-09-15T08:00' } });
		await fireEvent.click(screen.getByRole('button', { name: 'Buka shift' }));

		await waitFor(() => expect(navigation.goto).toHaveBeenCalledWith('/shift/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'));
		expect(body).toEqual({ station_id: '33333333-3333-4333-8333-333333333333', opened_at: '2026-09-15T08:00:00.000Z', backfilled: false, backfill_approver: null, backfill_reason: '', original_event_date: '', shift_ke: 0 });
		expect(navigation.invalidateAll).toHaveBeenCalled();
	});
});
