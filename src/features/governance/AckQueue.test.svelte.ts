import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { apiUrl } from '../../../test/mocks/handlers';
import { server } from '../../../test/mocks/server';
import AckQueue from './AckQueue.svelte';

const navigation = vi.hoisted(() => ({ invalidateAll: vi.fn().mockResolvedValue(undefined) }));
vi.mock('$app/navigation', () => navigation);

const stationId = '33333333-3333-4333-8333-333333333333';
const shift = { shift_id: '44444444-4444-4444-8444-444444444444', station_id: stationId, station_seq: 18, supervisor_id: '11111111-1111-4111-8111-111111111111', opened_at: '2026-09-13T08:00:00Z', business_date: '2026-09-13', status: 'awaiting_confirmation', current_report_id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd' };
const report = { report_id: shift.current_report_id, station_id: stationId, shift_id: shift.shift_id, version_no: 2, status: 'submitted', submitted_at: '2026-09-13T04:00:00.000Z', readings: [], sales: [], losses: [] };

function renderQueue(roles = ['Station Admin']) {
	return render(AckQueue, { shifts: [shift], session: { user_id: '99999999-9999-4999-8999-999999999999', username: 'admin.user', display_name: 'Admin', roles, org_id: 'org-1', station_ids: [stationId], active_context: null } });
}

describe('AckQueue', () => {
	it('acknowledges the selected report with the pinned response shape', async () => {
		let body: Record<string, unknown> | undefined;
		server.use(
			http.get(`${apiUrl}/reports/${report.report_id}`, () => HttpResponse.json(report)),
			http.post(`${apiUrl}/reports/${report.report_id}/acknowledgement`, async ({ request }) => {
				body = (await request.json()) as Record<string, unknown>;
				return HttpResponse.json({ AckID: 'ack-1', Decision: 'acked', IsBreakGlass: false, ReportID: report.report_id, ShiftStatus: 'locked', VersionNo: 2 });
			})
		);
		renderQueue();
		await fireEvent.click(screen.getByRole('button', { name: 'Lihat laporan' }));
		await fireEvent.click(await screen.findByRole('button', { name: 'Setujui laporan' }));

		await waitFor(() => expect(screen.getByText('Laporan disetujui.')).toBeInTheDocument());
		expect(body).toEqual({ station_id: stationId, shift_id: shift.shift_id, version_no: 2, decision: 'acked', is_break_glass: false });
	});

	it('requires a break-glass reason', async () => {
		server.use(
			http.get(`${apiUrl}/reports/${report.report_id}`, () => HttpResponse.json(report)),
			http.post(`${apiUrl}/reports/${report.report_id}/acknowledgement`, () => HttpResponse.json({ AckID: 'ack-1' }))
		);
		renderQueue(['Owner']);
		await fireEvent.click(screen.getByRole('button', { name: 'Lihat laporan' }));
		await fireEvent.click(await screen.findByRole('checkbox', { name: 'Gunakan break-glass' }));
		await fireEvent.click(screen.getByRole('button', { name: 'Setujui laporan' }));

		expect(screen.getByText('Alasan break-glass wajib diisi.')).toBeInTheDocument();
	});
});
