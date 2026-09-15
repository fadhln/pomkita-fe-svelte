import { describe, expect, it } from 'vitest';
import { load } from './+page';

describe('shift list load', () => {
	it('loads shifts and station from the parent session', async () => {
		await expect(load({ parent: async () => ({ session: { station_id: 'station-1' } }) } as never)).resolves.toEqual({ shifts: expect.any(Array), stationId: 'station-1' });
	});
});
