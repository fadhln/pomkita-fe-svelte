import type { PageLoad } from './$types';
import { activeStationForSession } from '$lib/station/active';

export const load: PageLoad = async ({ parent }) => {
	const parentData = await parent();
	const stationId = activeStationForSession(parentData.session, parentData.activeStationId);
	return { stationId, approverId: parentData.session?.user_id ?? '' };
};
