import type { PageLoad } from './$types';
import { getReport, getReportShift } from '../../../features/report/api';

export const load: PageLoad = async ({ params, parent }) => {
	const stationId = (await parent()).session?.station_ids?.[0] ?? '';
	const report = await getReport(params.reportId, stationId);
	const shift = await getReportShift(report.shift_id, stationId);
	return { report, shift, stationId };
};
