import { ApiError } from '$lib/api/client';

export function formatRupiahInput(value: string) {
	const digits = value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
	return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function unformatRupiahInput(value: string) {
	return value.replace(/\D/g, '') || '0';
}

export function formatDecimalDisplay(value: string) {
	const [integer, fraction] = value.split('.');
	const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
	return fraction ? `${grouped},${fraction}` : grouped;
}

type DecimalParts = { integer: bigint; scale: number };

function decimalParts(value: string): DecimalParts | null {
	if (!/^\d+(\.\d+)?$/.test(value)) return null;
	const [integer, fraction = ''] = value.split('.');
	return { integer: BigInt(`${integer}${fraction}`), scale: fraction.length };
}

function scaled(parts: DecimalParts, scale: number) {
	return parts.integer * BigInt(10) ** BigInt(scale - parts.scale);
}

function decimalString(value: bigint, scale: number) {
	const digits = value.toString().padStart(scale + 1, '0');
	if (!scale) return digits;
	const splitAt = digits.length - scale;
	return `${digits.slice(0, splitAt)}.${digits.slice(splitAt).replace(/0+$/, '') || '0'}`;
}

export function getRolloverDelta(start: string, end: string, meterMax: string) {
	const values = [decimalParts(start), decimalParts(end), decimalParts(meterMax)];
	if (values.some((value) => !value)) return null;
	const [startPart, endPart, maxPart] = values as DecimalParts[];
	const scale = Math.max(startPart.scale, endPart.scale, maxPart.scale);
	const startValue = scaled(startPart, scale);
	const endValue = scaled(endPart, scale);
	const maxValue = scaled(maxPart, scale);
	return endValue >= startValue
		? { delta: decimalString(endValue - startValue, scale), rollover: false }
		: { delta: decimalString(maxValue - startValue + endValue, scale), rollover: true };
}

export type LossInput = { direction: string; reason_code: string; liters: string; cash_amount: string; note: string };

export function validateLossRow(input: LossInput) {
	const errors: Partial<Record<'direction' | 'reason_code' | 'liters' | 'cash_amount', 'required' | 'invalid'>> = {};
	if (!['loss', 'gain'].includes(input.direction)) errors.direction = 'invalid';
	if (!input.reason_code.trim()) errors.reason_code = 'required';
	if (!input.liters.trim()) errors.liters = 'required';
	else if (!/^\d+(\.\d+)?$/.test(input.liters)) errors.liters = 'invalid';
	if (input.cash_amount && !/^\d+$/.test(input.cash_amount)) errors.cash_amount = 'invalid';
	return errors;
}

export function isDraftConflict(error: unknown) {
	return error instanceof ApiError && error.status === 409;
}
