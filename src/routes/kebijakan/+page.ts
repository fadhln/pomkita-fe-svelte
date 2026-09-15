import type { PageLoad } from './$types';
import { getPolicyHistory } from '../../features/policy/api';
import { activeStationForSession } from '$lib/station/active';

export const load: PageLoad = async ({ parent }) => {
	const parentData = await parent();
	const stationId = activeStationForSession(parentData.session, parentData.activeStationId);
	return { revisions: await getPolicyHistory(stationId), stationId };
};
