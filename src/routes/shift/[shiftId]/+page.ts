import type { PageLoad } from './$types';
import { draftFromShift, getShiftDetail } from '../../../features/shift-entry/api';
import { activeStationForSession } from '$lib/station/active';

export const load: PageLoad = async ({ params, parent }) => {
	const parentData = await parent();
	const stationId = activeStationForSession(parentData.session, parentData.activeStationId);
	const detail = await getShiftDetail(params.shiftId, stationId);
	return { shiftId: params.shiftId, detail, draft: draftFromShift(detail) };
};
