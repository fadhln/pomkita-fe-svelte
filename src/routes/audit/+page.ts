import type { PageLoad } from './$types';
import { ApiError } from '$lib/api/client';
import { getAuditRows, verifyAudit } from '../../features/audit/api';

export const load: PageLoad = async () => {
	// Audit reads need the Owner role; other roles receive 403. Treat that as
	// an empty trail instead of an error page.
	const [rows, verification] = await Promise.all([
		getAuditRows().catch((cause) => (cause instanceof ApiError && cause.status === 403 ? null : Promise.reject(cause))),
		verifyAudit().catch(() => null)
	]);
	return { rows: rows ?? [], verification };
};
