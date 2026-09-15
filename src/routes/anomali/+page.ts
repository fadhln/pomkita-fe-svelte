import type { PageLoad } from './$types';
import { getAnomalies } from '../../features/anomaly/api';

export const load: PageLoad = async ({ parent }) => {
	const session = (await parent()).session;
	const stationId = session?.station_ids?.[0] ?? '';
	return { anomalies: (await getAnomalies(stationId)) ?? [] };
};
