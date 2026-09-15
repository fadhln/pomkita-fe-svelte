import { fireEvent, render, screen } from '@testing-library/svelte';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { apiUrl } from '../../../test/mocks/handlers';
import { server } from '../../../test/mocks/server';
import BackfillForm from './BackfillForm.svelte';

describe('backfill form', () => {
	it('posts the OpenShiftRequest fields to the existing shifts endpoint', async () => {
		let body: Record<string, unknown> | undefined;
		server.use(http.post(`${apiUrl}/shifts`, async ({ request }) => { body = await request.json() as Record<string, unknown>; return HttpResponse.json({ shift_id: 'shift-backfill' }); }));
		render(BackfillForm, { stationId: 'station-1', approverId: 'owner-1' });
		await fireEvent.input(screen.getByLabelText('Tanggal kejadian asli'), { target: { value: '2026-09-01' } }); await fireEvent.input(screen.getByLabelText('Alasan backfill'), { target: { value: 'Shift terlambat' } }); await fireEvent.click(screen.getByRole('button', { name: 'Setujui dan buka backfill' }));
		await new Promise((resolve) => setTimeout(resolve, 0)); expect(body).toMatchObject({ station_id: 'station-1', backfilled: true, original_event_date: '2026-09-01', shift_ke: 1, backfill_approver: 'owner-1', backfill_reason: 'Shift terlambat' });
	});
});
