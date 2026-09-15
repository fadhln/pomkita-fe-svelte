import type { PageLoad } from './$types';
import { draftFromShift, getShiftDetail } from '../../../features/shift-entry/api';

export const load: PageLoad = async ({ params, parent }) => {
	const session = (await parent()).session;
	const stationId = session?.station_ids?.[0] ?? '';
	const detail = await getShiftDetail(params.shiftId, stationId);
	return { shiftId: params.shiftId, detail, draft: draftFromShift(detail) };
};
