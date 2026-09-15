import { describe, expect, it } from 'vitest';
import { load } from './+page';

describe('account page load', () => {
	it('loads the authenticated account profile', async () => {
		await expect(load({} as never)).resolves.toEqual({
			account: expect.objectContaining({ email: 'budi@example.com', username: 'test.user' })
		});
	});
});
