import type { PageLoad } from './$types';
import { getUsers } from '../../../features/users/api';
import { hasRole } from '$lib/session/api';

export const load: PageLoad = async ({ parent, url }) => {
	const session = (await parent()).session;
	const isOwner = hasRole(session?.roles, 'Owner');
	const isSuperadmin = hasRole(session?.roles, 'Superadmin');
	const authorized = isOwner || isSuperadmin;
	if (!authorized) return { users: [], isOwner, isSuperadmin, authorized: false, stationIds: session?.station_ids ?? [] };

	const orgId = isSuperadmin ? (url.searchParams.get('org_id') ?? session?.org_id) : undefined;
	return { users: await getUsers(orgId), isOwner, isSuperadmin, authorized: true, stationIds: session?.station_ids ?? [] };
};
