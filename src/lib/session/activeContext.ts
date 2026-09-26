import { apiFetch } from '$lib/api/client';

export type ActiveContext = { org_id: string; station_id: string };

export function setActiveContext(orgId: string, stationId: string) {
	return apiFetch<{ active_context: ActiveContext }>('/session/active-context', {
		method: 'POST',
		body: JSON.stringify({ org_id: orgId, station_id: stationId })
	});
}
