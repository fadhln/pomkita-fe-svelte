import { goto } from '$app/navigation';
import { setSessionExpiredHandler } from '$lib/api/client';

export function installSessionExpiryRedirect() {
	let redirecting = false;
	const redirectToLogin = () => {
		if (redirecting) return;
		redirecting = true;
		void goto('/masuk');
	};

	setSessionExpiredHandler(redirectToLogin);
	return () => setSessionExpiredHandler(undefined);
}
