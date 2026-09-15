import { describe, expect, it } from 'vitest';
import { load } from './+page';

describe('backfill load', () => {
	it('passes the station and current user as approver', async () => {
		await expect(load({ parent: async () => ({ session: { station_ids: ['station-1'], user_id: 'owner-1' } }) } as never)).resolves.toEqual({ stationId: 'station-1', approverId: 'owner-1' });
	});
});
