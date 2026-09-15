import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { apiUrl } from '../../../test/mocks/handlers';
import { server } from '../../../test/mocks/server';
import { load } from './+page';

describe('report list load', () => {
	it('loads only shifts with a current report for the session station', async () => {
		server.use(http.get(`${apiUrl}/shifts`, ({ request }) => { expect(new URL(request.url).searchParams.get('station_id')).toBe('station-1'); return HttpResponse.json([{ shift_id: 'shift-1', station_id: 'station-1', station_seq: 1, supervisor_id: 'user-1', opened_at: '2026-09-01', business_date: '2026-09-01', status: 'locked', current_report_id: 'report-1' }]); }));
		await expect(load({ parent: async () => ({ session: { station_ids: ['station-1'] } }) } as never)).resolves.toMatchObject({ stationId: 'station-1', reports: [{ current_report_id: 'report-1' }] });
	});
});
