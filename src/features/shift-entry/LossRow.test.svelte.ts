import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import LossRow from './LossRow.svelte';

describe('LossRow', () => {
	it('offers the optional evidence exception and saves loss fields', async () => {
		const onSave = vi.fn();
		render(LossRow, {
			loss: { row_id: 'row-1', loss_id: 'loss-1', direction: 'loss', reason_code: '', liters: '1.25', cash_amount: null, note: null },
			reasonCodes: ['kebocoran'],
			evidenceMode: 'opsional',
			onSave,
			onUpload: vi.fn()
		});

		expect(screen.getByRole('option', { name: 'loss_exception' })).toBeInTheDocument();
		await fireEvent.input(screen.getByLabelText('Catatan Loss dan gain'), { target: { value: 'catatan' } });
		await fireEvent.blur(screen.getByLabelText('Catatan Loss dan gain'));
		expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ reason_code: 'loss_exception', liters: '1.25', note: 'catatan' }));
	});
});
