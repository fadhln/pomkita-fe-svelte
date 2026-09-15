import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import ReportTables from './ReportTables.svelte';

describe('report tables', () => {
	it('renders authoritative decimal strings without calculating', () => {
		render(ReportTables, { report: { report_id: 'r', station_id: 's', shift_id: 'sh', version_no: 1, status: 'submitted', submitted_at: '2026-09-01T00:00:00Z', readings: [{ nozzle_id: 'n', meter_start: '100.00', meter_end: '125.00', expected_sale: '250000.00' }], sales: [], losses: [] } });
		expect(screen.getByText('125.00')).toBeInTheDocument();
		expect(screen.getByText('250000.00')).toBeInTheDocument();
	});
});
