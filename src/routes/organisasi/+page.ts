import type { PageLoad } from './$types';
import { getOrganization, getOrganizations } from '../../features/organization/api';

function hasRole(roles: string[] | null | undefined, role: string) {
	return (roles ?? []).some((item) => item.toLowerCase() === role.toLowerCase());
}

export const load: PageLoad = async ({ parent }) => {
	const session = (await parent()).session;
	const isOwner = hasRole(session?.roles, 'Owner');
	const isSuperadmin = hasRole(session?.roles, 'Superadmin');
	if (!isOwner && !isSuperadmin) return { organizations: [], isOwner, isSuperadmin, authorized: false };

	const summaries = await getOrganizations();
	const organizations = await Promise.all(summaries.map(({ id }) => getOrganization(id)));
	return { organizations, isOwner, isSuperadmin, authorized: true };
};
