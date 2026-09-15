import type { PageLoad } from './$types';
import { getShifts } from '../../features/shift-entry/api';

export const load: PageLoad = async ({ parent }) => {
	const parentData = await parent();
	return { shifts: await getShifts(), stationId: parentData.session?.station_id ?? '' };
};
