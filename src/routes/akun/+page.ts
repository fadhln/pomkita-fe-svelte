import type { PageLoad } from './$types';
import { getAccount } from '../../features/account/api';

export const load: PageLoad = async () => ({ account: await getAccount() });
