import type { PageLoad } from './$types';
import { getReport, getReportShift } from '../../../features/report/api';
import { activeStationForSession } from '$lib/station/active';

export const load: PageLoad = async ({ params, parent }) => {
	const parentData = await parent();
	const stationId = activeStationForSession(parentData.session, parentData.activeStationId);
	const report = await getReport(params.reportId, stationId);
	const shift = await getReportShift(report.shift_id, stationId);
	return { report, shift, stationId };
};
