import type { PageLoad } from './$types';
import { getReportShifts } from '../../features/report/api';

export const load: PageLoad = async ({ parent }) => {
	const stationId = (await parent()).session?.station_ids?.[0] ?? '';
	return { reports: await getReportShifts(stationId), stationId };
};
