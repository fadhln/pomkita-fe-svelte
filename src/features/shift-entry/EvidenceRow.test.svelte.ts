import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import EvidenceRow from './EvidenceRow.svelte';

describe('EvidenceRow', () => {
	it('passes the selected file to the form owner', async () => {
		const onUpload = vi.fn();
		render(EvidenceRow, { mode: 'wajib', hasEvidence: false, onUpload });
		const file = new File(['foto'], 'bukti.jpg', { type: 'image/jpeg' });

		await fireEvent.change(screen.getByLabelText('Bukti Loss dan gain'), { target: { files: [file] } });
		expect(onUpload).toHaveBeenCalledWith(file);
	});
});
