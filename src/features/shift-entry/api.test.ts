import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { apiUrl } from '../../../test/mocks/handlers';
import { server } from '../../../test/mocks/server';
import { setActiveStationCookie } from '$lib/station/active';
import {
	claimDraft,
	getShifts,
	getShiftDetail,
	openShift,
	submitShift,
	uploadDraftEvidence,
	writeDraftLoss,
	writeDraftReading,
	writeDraftSales
} from './api';

const ids = {
	shift: '44444444-4444-4444-8444-444444444444',
	station: '33333333-3333-4333-8333-333333333333',
	draft: '55555555-5555-4555-8555-555555555555',
	claim: '66666666-6666-4666-8666-666666666666',
	nozzle: '77777777-7777-4777-8777-777777777777',
	dispenser: '88888888-8888-4888-8888-888888888888',
	loss: '99999999-9999-4999-8999-999999999999'
} as const;

describe('shift API', () => {
	it('sends station scope as station_id and not as a cookie authority header', async () => {
		setActiveStationCookie('station-2');
		server.use(http.get(`${apiUrl}/shifts`, ({ request }) => {
			expect(new URL(request.url).searchParams.get('station_id')).toBe('station-2');
			expect(request.headers.get('X-Active-Station')).toBeNull();
			return HttpResponse.json([]);
		}));

		await expect(getShifts('station-2')).resolves.toEqual([]);
	});

	it('uses the real shift and draft response shapes', async () => {
		await expect(openShift({ station_id: ids.station, opened_at: '2026-09-13T08:00:00Z' })).resolves.toMatchObject({ shift_id: ids.shift, station_id: ids.station });
		await expect(getShiftDetail(ids.shift, ids.station)).resolves.toMatchObject({ draft_id: ids.draft, revision: 2 });
		await expect(claimDraft({ station_id: ids.station, shift_id: ids.shift, draft_id: ids.draft })).resolves.toMatchObject({
			draft_id: ids.draft,
			claim_token: ids.claim,
			revision: 2
		});
	});

	it('sends decimal strings for every draft mutation', async () => {
		const requests: Record<string, unknown>[] = [];
		server.use(
			http.post(`${apiUrl}/drafts/readings`, async ({ request }) => {
				requests.push((await request.json()) as Record<string, unknown>);
				return HttpResponse.json({ revision: 3 });
			}),
			http.post(`${apiUrl}/drafts/sales`, async ({ request }) => {
				requests.push((await request.json()) as Record<string, unknown>);
				return HttpResponse.json({ revision: 4 });
			}),
			http.post(`${apiUrl}/drafts/losses`, async ({ request }) => {
				requests.push((await request.json()) as Record<string, unknown>);
				return HttpResponse.json({ revision: 5 });
			}),
			http.post(`${apiUrl}/drafts/evidence`, async ({ request }) => {
				requests.push((await request.json()) as Record<string, unknown>);
				return HttpResponse.json({ revision: 6 });
			})
		);

		await writeDraftReading({ station_id: ids.station, draft_id: ids.draft, claim_token: ids.claim, revision: 2, nozzle_id: ids.nozzle, meter_start: '999999999999999999.1', meter_end: '2.25' });
		await writeDraftSales({ station_id: ids.station, draft_id: ids.draft, claim_token: ids.claim, revision: 3, dispenser_id: ids.dispenser, cash_amount: '1000000000000000000.50', cashless_amount: '0' });
		await writeDraftLoss({ station_id: ids.station, draft_id: ids.draft, claim_token: ids.claim, revision: 4, loss_id: ids.loss, direction: 'loss', reason_code: 'kebocoran', liters: '1.25', cash_amount: '', note: 'catatan' });
		await uploadDraftEvidence({ station_id: ids.station, draft_id: ids.draft, claim_token: ids.claim, revision: 5, loss_row_id: ids.loss, evidence_type: 'loss', object_key: 'object', content_hash: 'a'.repeat(64), size_bytes: 4, mime: 'image/jpeg' });

		expect(requests).toEqual([
			expect.objectContaining({ meter_start: '999999999999999999.1', meter_end: '2.25' }),
			expect.objectContaining({ cash_amount: '1000000000000000000.50', cashless_amount: '0' }),
			expect.objectContaining({ loss_id: ids.loss, liters: '1.25', cash_amount: '', note: 'catatan' }),
			expect.objectContaining({ loss_row_id: ids.loss, content_hash: 'a'.repeat(64), size_bytes: 4, mime: 'image/jpeg' })
		]);
	});

	it('sends the submit idempotency key and preserves replay responses', async () => {
		const key = 'submit-key-1';
		const input = { station_id: ids.station, shift_id: ids.shift, draft_id: ids.draft, claim_token: ids.claim, revision: 2, payload: { hash_version: 1, readings: [], sales: [], losses: [] } } as const;
		await expect(submitShift(input, key)).resolves.toEqual({ report_id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', replay: false, request_hash: 'cmVxdWVzdA' });
		await expect(submitShift(input, key)).resolves.toEqual({ report_id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', replay: true, request_hash: 'cmVwbGF5' });
		await expect(submitShift({ ...input, revision: 3 }, key)).rejects.toMatchObject({ status: 409 });
	});
});
