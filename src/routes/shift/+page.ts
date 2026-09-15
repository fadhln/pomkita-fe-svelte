import type { PageLoad } from './$types';
import { getShifts } from '../../features/shift-entry/api';

export const load: PageLoad = async ({ parent }) => {
	const parentData = await parent();
	const stationId = parentData.session?.station_ids?.[0] ?? '';
	return { shifts: (await getShifts(stationId)) ?? [], stationId };
};
