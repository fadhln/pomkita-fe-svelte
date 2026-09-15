import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { apiUrl } from '../../../test/mocks/handlers';
import { server } from '../../../test/mocks/server';
import { getAnomalies } from './api';

describe('anomaly API', () => {
	it('loads anomalies for the selected station', async () => {
		const stationId = '33333333-3333-4333-8333-333333333333';
		server.use(http.get(`${apiUrl}/anomalies`, ({ request }) => {
			expect(new URL(request.url).searchParams.get('station_id')).toBe(stationId);
			return HttpResponse.json([{ event_id: 'event-1', station_id: stationId, rule_id: 'rule-1', subject_kind: 'report', subject_id: 'report-1', event_type: 'fired', source_kind: 'break_glass', source_id: 'ack-1', happened_at: '2026-09-13T04:00:00.000Z' }]);
		}));

		await expect(getAnomalies(stationId)).resolves.toHaveLength(1);
	});
});
