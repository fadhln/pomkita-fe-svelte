import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import SalesRow from './SalesRow.svelte';

describe('SalesRow', () => {
	it('masks money for display and sends the decimal string without punctuation', async () => {
		const onSave = vi.fn();
		render(SalesRow, {
			dispenser: { dispenser_id: 'dispenser-1', label: 'D-01' },
			sale: { row_id: 'row-1', dispenser_id: 'dispenser-1', cash_amount: '1250000', cashless_amount: '350000' },
			onSave
		});

		expect(screen.getByLabelText('Tunai Dispenser D-01')).toHaveValue('1.250.000');
		await fireEvent.input(screen.getByLabelText('Tunai Dispenser D-01'), { target: { value: '2000000' } });
		await fireEvent.blur(screen.getByLabelText('Tunai Dispenser D-01'));
		expect(onSave).toHaveBeenCalledWith({ cash_amount: '2000000', cashless_amount: '350000' });
	});
});
