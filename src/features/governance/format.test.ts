import { describe, expect, it } from 'vitest';
import { formatAmendmentValue } from './format';

describe('amendment value formatting', () => {
	it('formats raw JSON scalar strings as Rupiah', () => {
		expect(formatAmendmentValue('"2000"', 'cash_amount')).toBe('Rp2.000');
		expect(formatAmendmentValue(125000, 'cashless_amount')).toBe('Rp125.000');
	});

	it('keeps the decimal string for liters', () => {
		expect(formatAmendmentValue('"10.50"', 'liters')).toBe('10,50 L');
	});
});
