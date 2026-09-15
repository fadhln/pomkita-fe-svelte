import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { ApiError } from '$lib/api/client';
import { getSession } from '$lib/session/api';

export const load: LayoutLoad = async ({ route }) => {
	const isLogin = route.id === '/masuk';
	if (isLogin) return { isLogin, session: null };

	try {
		return { isLogin, session: await getSession() };
	} catch (cause) {
		if (cause instanceof ApiError && cause.status === 401) {
			throw redirect(303, '/masuk');
		}
		throw cause;
	}
};
