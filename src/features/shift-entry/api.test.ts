import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { apiUrl } from '../../../test/mocks/handlers';
import { server } from '../../../test/mocks/server';
import {
	claimDraft,
	getDraft,
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
	it('uses the real shift and draft response shapes', async () => {
		await expect(openShift({ station_id: ids.station })).resolves.toEqual({ shift_id: ids.shift });
		await expect(claimDraft(ids.shift)).resolves.toEqual({
			draft_id: ids.draft,
			claim_token: ids.claim,
			revision: 2
		});
		await expect(getDraft(ids.shift)).resolves.toMatchObject({ draft_id: ids.draft, revision: 2 });
	});

	it('sends decimal strings for every draft mutation', async () => {
		const requests: Record<string, unknown>[] = [];
		server.use(
			http.post(`${apiUrl}/draft/reading`, async ({ request }) => {
				requests.push((await request.json()) as Record<string, unknown>);
				return HttpResponse.json({ revision: 3 });
			}),
			http.post(`${apiUrl}/draft/sales`, async ({ request }) => {
				requests.push((await request.json()) as Record<string, unknown>);
				return HttpResponse.json({ revision: 4 });
			}),
			http.post(`${apiUrl}/draft/loss`, async ({ request }) => {
				requests.push((await request.json()) as Record<string, unknown>);
				return HttpResponse.json({ revision: 5 });
			}),
			http.post(`${apiUrl}/draft/evidence`, async ({ request }) => {
				requests.push((await request.json()) as Record<string, unknown>);
				return HttpResponse.json({ revision: 6 });
			})
		);

		await writeDraftReading({ draft_id: ids.draft, claim_token: ids.claim, revision: 2, nozzle_id: ids.nozzle, meter_start: '999999999999999999.1', meter_end: '2.25' });
		await writeDraftSales({ draft_id: ids.draft, claim_token: ids.claim, revision: 3, dispenser_id: ids.dispenser, cash_amount: '1000000000000000000.50', cashless_amount: '0' });
		await writeDraftLoss({ draft_id: ids.draft, claim_token: ids.claim, revision: 4, loss_id: ids.loss, direction: 'loss', reason_code: 'kebocoran', liters: '1.25', cash_amount: '', note: 'catatan' });
		await uploadDraftEvidence({ draft_id: ids.draft, claim_token: ids.claim, revision: 5, loss_row_id: ids.loss, evidence_type: 'loss', object_key: 'object', content_hash: 'a'.repeat(64), size_bytes: 4, mime: 'image/jpeg' });

		expect(requests).toEqual([
			expect.objectContaining({ meter_start: '999999999999999999.1', meter_end: '2.25' }),
			expect.objectContaining({ cash_amount: '1000000000000000000.50', cashless_amount: '0' }),
			expect.objectContaining({ loss_id: ids.loss, liters: '1.25', cash_amount: '', note: 'catatan' }),
			expect.objectContaining({ loss_row_id: ids.loss, content_hash: 'a'.repeat(64), size_bytes: 4, mime: 'image/jpeg' })
		]);
	});

	it('sends the submit idempotency key and preserves replay responses', async () => {
		const key = 'submit-key-1';
		const input = { shift_id: ids.shift, draft_id: ids.draft, claim_token: ids.claim, revision: 2, hash_version: 1, readings: [], sales: [], losses: [] } as const;
		await expect(submitShift(input, key)).resolves.toEqual({ report_id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', replay: false });
		await expect(submitShift(input, key)).resolves.toEqual({ report_id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', replay: true });
		await expect(submitShift({ ...input, revision: 3 }, key)).rejects.toMatchObject({ status: 409 });
	});
});
