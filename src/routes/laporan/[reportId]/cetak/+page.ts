import type { PageLoad } from './$types';
import { getReportPrintout } from '../../../../features/report/api';

export const load: PageLoad = async ({ params, parent }) => {
	const stationId = (await parent()).session?.station_ids?.[0] ?? '';
	return { report: await getReportPrintout(params.reportId, stationId) };
};
