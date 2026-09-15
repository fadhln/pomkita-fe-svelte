import { describe, expect, it } from 'vitest';
import { load } from './+page';

describe('draft load', () => {
	it('loads the draft by shift ID', async () => {
		await expect(load({ params: { shiftId: '44444444-4444-4444-8444-444444444444' } } as never)).resolves.toMatchObject({ shiftId: '44444444-4444-4444-8444-444444444444', draft: { draft_id: '55555555-5555-4555-8555-555555555555' } });
	});
});
