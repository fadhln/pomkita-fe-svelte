import type { PageLoad } from './$types';
import { getReportPrintout } from '../../../../features/report/api';
import { activeStationForSession } from '$lib/station/active';

export const load: PageLoad = async ({ params, parent }) => {
	const parentData = await parent();
	const stationId = activeStationForSession(parentData.session, parentData.activeStationId);
	return { report: await getReportPrintout(params.reportId, stationId) };
};
