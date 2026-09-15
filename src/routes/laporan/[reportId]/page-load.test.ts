import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { apiUrl } from '../../../../test/mocks/handlers';
import { server } from '../../../../test/mocks/server';
import { load } from './+page';

describe('report detail load', () => {
	it('loads the report and its shift detail using station scope', async () => {
		server.use(
			http.get(`${apiUrl}/reports/report-1`, () => HttpResponse.json({ report_id: 'report-1', station_id: 'station-1', shift_id: 'shift-1', version_no: 2, status: 'locked', submitted_at: '2026-09-01T00:00:00Z', readings: [], sales: [], losses: [] })),
			http.get(`${apiUrl}/shifts/shift-1`, () => HttpResponse.json({ shift_id: 'shift-1', station_id: 'station-1', station_seq: 4, supervisor_id: 'user-1', opened_at: '2026-09-01', business_date: '2026-09-01', status: 'locked', draft_id: 'draft-1', revision: 3 }))
		);
		await expect(load({ params: { reportId: 'report-1' }, parent: async () => ({ session: { station_ids: ['station-1'] } }) } as never)).resolves.toMatchObject({ report: { report_id: 'report-1' }, shift: { shift_id: 'shift-1', draft_id: 'draft-1' } });
	});
});
