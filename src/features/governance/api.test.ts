import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { apiUrl } from '../../../test/mocks/handlers';
import { server } from '../../../test/mocks/server';
import { acknowledgeReport, approveAmendment, getAmendments, rejectAmendment } from './api';

const stationId = '33333333-3333-4333-8333-333333333333';
const reportId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const amendmentId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const hash = 'ab'.repeat(32);

describe('governance API', () => {
	it('reads PascalCase amendment queue values without changing raw values', async () => {
		server.use(http.get(`${apiUrl}/amendments`, () => HttpResponse.json([{ AmendmentID: amendmentId, StaleCheckHash: hash, Items: [{ OldValue: '"2000"', NewValue: '"2500"' }] }])));

		await expect(getAmendments()).resolves.toEqual([{ AmendmentID: amendmentId, StaleCheckHash: hash, Items: [{ OldValue: '"2000"', NewValue: '"2500"' }] }]);
	});

	it('sends the queue hash and station to approve, and uses 204 for reject', async () => {
		const requests: Record<string, unknown>[] = [];
		server.use(
			http.post(`${apiUrl}/amendments/${amendmentId}/approve`, async ({ request }) => {
				requests.push((await request.json()) as Record<string, unknown>);
				return HttpResponse.json({ AmendmentID: amendmentId, StaleCheckHash: 'base64-result' });
			}),
			http.post(`${apiUrl}/amendments/${amendmentId}/reject`, async ({ request }) => {
				requests.push((await request.json()) as Record<string, unknown>);
				return new HttpResponse(null, { status: 204 });
			})
		);

		await expect(approveAmendment({ amendmentId, stationId, staleCheckHash: hash })).resolves.toMatchObject({ AmendmentID: amendmentId });
		await expect(rejectAmendment({ amendmentId, stationId, rejectionReason: 'Data tidak sesuai.' })).resolves.toBeUndefined();
		expect(requests).toEqual([
			{ station_id: stationId, stale_check_hash: hash },
			{ station_id: stationId, rejection_reason: 'Data tidak sesuai.' }
		]);
	});

	it('sends an acknowledgement with the report path and break-glass reason', async () => {
		let requestBody: Record<string, unknown> | undefined;
		server.use(http.post(`${apiUrl}/reports/${reportId}/acknowledgement`, async ({ request }) => {
			requestBody = (await request.json()) as Record<string, unknown>;
			return HttpResponse.json({ AckID: 'ack-1', Decision: 'acked', IsBreakGlass: true, ReportID: reportId, ShiftStatus: 'locked', VersionNo: 2 });
		}));

		await expect(acknowledgeReport({ reportId, stationId, shiftId: 'shift-1', versionNo: 2, decision: 'acked', isBreakGlass: true, breakGlassReason: 'Darurat operasional.' })).resolves.toMatchObject({ AckID: 'ack-1', ShiftStatus: 'locked' });
		expect(requestBody).toEqual({ station_id: stationId, shift_id: 'shift-1', version_no: 2, decision: 'acked', is_break_glass: true, break_glass_reason: 'Darurat operasional.' });
	});
});
