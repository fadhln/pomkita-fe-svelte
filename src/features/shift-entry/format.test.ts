import { describe, expect, it } from 'vitest';
import { formatDecimalDisplay, formatRupiahInput, getRolloverDelta, unformatRupiahInput, validateLossRow } from './format';

describe('shift entry formatting', () => {
	it('formats display values without numeric conversion', () => {
		expect(formatRupiahInput('1234567890')).toBe('1.234.567.890');
		expect(unformatRupiahInput('1.234.567.890')).toBe('1234567890');
		expect(formatDecimalDisplay('5000.25')).toBe('5.000,25');
	});

	it('calculates a rollover delta with decimal strings', () => {
		expect(getRolloverDelta('99999.9', '0.5', '100000')).toEqual({ delta: '0.6', rollover: true });
	});

	it('validates required loss fields', () => {
		expect(validateLossRow({ direction: 'loss', reason_code: '', liters: '', cash_amount: '', note: '' })).toEqual({ reason_code: 'required', liters: 'required' });
		expect(validateLossRow({ direction: 'gain', reason_code: 'delivery_spill', liters: '1.25', cash_amount: '', note: '' })).toEqual({});
	});
});
