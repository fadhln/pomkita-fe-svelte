import type { PageLoad } from './$types';
import { getReportShifts } from '../../features/report/api';
import { activeStationForSession } from '$lib/station/active';

export const load: PageLoad = async ({ parent }) => {
	const parentData = await parent();
	const stationId = activeStationForSession(parentData.session, parentData.activeStationId);
	return { reports: await getReportShifts(stationId), stationId };
};
