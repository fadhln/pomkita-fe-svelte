import type { PageLoad } from './$types';
import { getAnomalies } from '../../features/anomaly/api';
import { activeStationForSession } from '$lib/station/active';

export const load: PageLoad = async ({ parent }) => {
	const parentData = await parent();
	const stationId = activeStationForSession(parentData.session, parentData.activeStationId);
	return { anomalies: (await getAnomalies(stationId)) ?? [] };
};
