import type { PageLoad } from './$types';
import { getAmendments, getAwaitingConfirmation } from '../../features/governance/api';

export const load: PageLoad = async ({ parent }) => {
	const session = (await parent()).session;
	const stationId = session?.station_ids?.[0] ?? '';
	const [amendments, shifts] = await Promise.all([getAmendments(), getAwaitingConfirmation(stationId)]);
	return { amendments: amendments ?? [], shifts: shifts ?? [], session };
};
