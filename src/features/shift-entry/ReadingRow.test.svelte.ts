import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import ReadingRow from './ReadingRow.svelte';

describe('ReadingRow', () => {
	it('shows decimal readings and the server-safe rollover delta', async () => {
		const onSave = vi.fn();
		render(ReadingRow, {
			nozzle: { nozzle_id: 'nozzle-1', label: 'N-01', meter_max: '100000' },
			reading: { row_id: 'row-1', nozzle_id: 'nozzle-1', meter_start: '99999.9', meter_end: '0.5' },
			onSave
		});

		expect(screen.getByText('Delta: 0.6')).toBeInTheDocument();
		await fireEvent.blur(screen.getByLabelText('Meter akhir Nozzle N-01'));
		expect(onSave).toHaveBeenCalledWith({ meter_start: '99999.9', meter_end: '0.5' });
	});
});
