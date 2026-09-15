import { describe, expect, it } from 'vitest';
import { load } from './+page';

describe('draft load', () => {
	it('loads shift detail by shift ID', async () => {
		await expect(load({ params: { shiftId: '44444444-4444-4444-8444-444444444444' }, parent: async () => ({ session: { station_ids: ['33333333-3333-4333-8333-333333333333'] } }) } as never)).resolves.toMatchObject({ shiftId: '44444444-4444-4444-8444-444444444444', detail: { draft_id: '55555555-5555-4555-8555-555555555555', revision: 2 }, draft: { draft_id: '55555555-5555-4555-8555-555555555555' } });
	});
});
