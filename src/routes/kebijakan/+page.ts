import type { PageLoad } from './$types';
import { getPolicyHistory } from '../../features/policy/api';

export const load: PageLoad = async ({ parent }) => {
	const stationId = (await parent()).session?.station_ids?.[0] ?? '';
	return { revisions: await getPolicyHistory(stationId), stationId };
};
