import { describe, expect, it } from 'vitest';
import { load } from './+page';

describe('aktivasi load', () => {
	it('reads the token from the query string', async () => {
		expect(load({ url: new URL('http://localhost/aktivasi?token=invite-token') } as never)).toEqual({ token: 'invite-token' });
	});

	it('returns an empty token when the query parameter is absent', async () => {
		expect(load({ url: new URL('http://localhost/aktivasi') } as never)).toEqual({ token: '' });
	});
});
