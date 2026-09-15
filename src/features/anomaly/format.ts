export function formatAnomalyDate(value: string) {
	return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(new Date(value));
}

export function anomalyLabel(value: string) {
	if (value === 'fired') return 'Terdeteksi';
	if (value === 'break_glass') return 'Break-glass';
	if (value === 'report') return 'Laporan';
	if (value === 'shift') return 'Shift';
	return value.replaceAll('_', ' ');
}
