import type { PageLoad } from './$types';
import { ApiError } from '$lib/api/client';
import { getAmendments, getAwaitingConfirmation } from '../../features/governance/api';

export const load: PageLoad = async ({ parent }) => {
	const session = (await parent()).session;
	const stationId = session?.station_ids?.[0] ?? '';
	// Only Station Admin and Owner roles see the amendment queue; other roles
	// receive 403. Treat that as an empty queue instead of an error page.
	const [amendments, shifts] = await Promise.all([
		getAmendments().catch((cause) => (cause instanceof ApiError && cause.status === 403 ? null : Promise.reject(cause))),
		getAwaitingConfirmation(stationId)
	]);
	return { amendments: amendments ?? [], shifts: shifts ?? [], session };
};
