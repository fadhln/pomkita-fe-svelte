import type { PageLoad } from './$types';
import { getDraft } from '../../../features/shift-entry/api';

export const load: PageLoad = async ({ params }) => ({ shiftId: params.shiftId, draft: await getDraft(params.shiftId) });
