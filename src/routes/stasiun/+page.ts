import type { PageLoad } from './$types';
import { getStation, getStations } from '../../features/station/api';

function hasRole(roles: string[] | null | undefined, role: string) {
	return (roles ?? []).some((item) => item.toLowerCase() === role.toLowerCase());
}

export const load: PageLoad = async ({ parent }) => {
	const session = (await parent()).session;
	const isOwner = hasRole(session?.roles, 'Owner');
	const isSuperadmin = hasRole(session?.roles, 'Superadmin');
	if (!isOwner && !isSuperadmin) return { stations: [], isOwner, isSuperadmin, authorized: false };

	const summaries = await getStations();
	const stations = await Promise.all(summaries.map(({ id }) => getStation(id)));
	return { stations, isOwner, isSuperadmin, authorized: true };
};
