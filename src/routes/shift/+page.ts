import type { PageLoad } from './$types';
import { getShifts } from '../../features/shift-entry/api';
import { activeStationForSession } from '$lib/station/active';

export const load: PageLoad = async ({ parent }) => {
	const parentData = await parent();
	const stationId = activeStationForSession(parentData.session, parentData.activeStationId);
	return { shifts: (await getShifts(stationId)) ?? [], stationId };
};
