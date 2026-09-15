import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const session = (await parent()).session;
	return { stationId: session?.station_ids?.[0] ?? '', approverId: session?.user_id ?? '' };
};
