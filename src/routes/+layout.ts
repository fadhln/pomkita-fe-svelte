import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { ApiError } from '$lib/api/client';
import { getSession } from '$lib/session/api';

// Session resolution uses the browser session cookie, so the auth shell
// renders on the client only. Server rendering would call the API without
// the cookie and force a false redirect to /masuk on every hard navigation.
export const ssr = false;

export const load: LayoutLoad = async ({ route }) => {
	const isPublic = ['/masuk', '/aktivasi', '/lupa-sandi', '/reset-sandi'].includes(route.id ?? '');
	if (isPublic) return { isLogin: true, session: null };

	try {
		return { isLogin: false, session: await getSession() };
	} catch (cause) {
		if (cause instanceof ApiError && cause.status === 401) {
			throw redirect(303, '/masuk');
		}
		throw cause;
	}
};
