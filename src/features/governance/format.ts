const CASH_FIELDS = new Set(['cash_amount', 'cashless_amount']);

function scalarText(value: unknown) {
	if (typeof value === 'string') {
		const trimmed = value.trim();
		if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
			try {
				const parsed = JSON.parse(trimmed);
				if (typeof parsed === 'string') return parsed;
			} catch {
				return value;
			}
		}
		return value;
	}
	if (value === null || value === undefined) return '—';
	if (typeof value === 'object') return JSON.stringify(value);
	return String(value);
}

function groupInteger(value: string) {
	return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function formatDecimal(value: string) {
	const sign = value.startsWith('-') ? '-' : '';
	const unsigned = sign ? value.slice(1) : value;
	const [integer, fraction] = unsigned.split('.', 2);
	return `${sign}${groupInteger(integer || '0')}${fraction === undefined ? '' : `,${fraction}`}`;
}

export function formatAmendmentValue(value: unknown, field: string) {
	const raw = scalarText(value);
	if (CASH_FIELDS.has(field)) return `Rp${formatDecimal(raw)}`;
	if (field === 'liters') return `${formatDecimal(raw)} L`;
	return raw;
}

export function formatGovernanceDate(value: string) {
	return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(new Date(value));
}
