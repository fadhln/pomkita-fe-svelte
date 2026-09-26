import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { ApiError } from '$lib/api/client';
import { getOrganizations } from '../features/organization/api';
import { hasRole, getSession } from '$lib/session/api';
import { getStations } from '../features/station/api';
import { activeStationForSession, permittedStations } from '$lib/station/active';

// Session resolution uses the browser session cookie, so the auth shell
// renders on the client only. Server rendering would call the API without
// the cookie and force a false redirect to /masuk on every hard navigation.
export const ssr = false;

export const load: LayoutLoad = async ({ route }) => {
	const isPublic = ['/masuk', '/aktivasi', '/lupa-sandi', '/reset-sandi'].includes(route.id ?? '');
	if (isPublic) return { isLogin: true, session: null };

	try {
		const session = await getSession();
		const stationId = activeStationForSession(session);
		const isSuperadmin = hasRole(session.roles, 'Superadmin');
		const stations = stationId ? await getStations(session.active_context?.org_id).catch(() => []) : [];
		const organizations = isSuperadmin ? await getOrganizations().catch(() => []) : [];
		return {
			isLogin: false,
			session,
			activeStationId: stationId,
			stations: permittedStations(session, stations),
			// Superadmins pick a disabled scope for historical reads; keep the flag.
			scopeStations: isSuperadmin ? stations : undefined,
			organizations
		};
	} catch (cause) {
		if (cause instanceof ApiError && cause.status === 401) {
			throw redirect(303, '/masuk');
		}
		throw cause;
	}
};
