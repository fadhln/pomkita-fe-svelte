import type { PageLoad } from './$types';
import { getAuditRows, verifyAudit } from '../../features/audit/api';

export const load: PageLoad = async () => {
	const [rows, verification] = await Promise.all([getAuditRows(), verifyAudit().catch(() => null)]);
	return { rows, verification };
};
