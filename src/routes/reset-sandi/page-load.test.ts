import { describe, expect, it } from 'vitest';
import { load } from './+page';

describe('reset password page load', () => {
	it('reads the token query parameter', () => {
		expect(load({ url: new URL('http://localhost/reset-sandi?token=abc123') } as never)).toEqual({ token: 'abc123' });
	});
});
