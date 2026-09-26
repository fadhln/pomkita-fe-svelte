import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import { draftFixture, apiUrl } from '../../../test/mocks/handlers';
import { hasUnsavedShiftEdits, setUnsavedShiftEdits } from '$lib/session/unsaved';
import { server } from '../../../test/mocks/server';
import { http, HttpResponse } from 'msw';
import Form from './Form.svelte';

const navigation = vi.hoisted(() => ({ invalidateAll: vi.fn().mockResolvedValue(undefined) }));
vi.mock('$app/navigation', () => navigation);

describe('Form', () => {
	it('claims the draft, confirms, and submits the wire payload', async () => {
		const requests: Request[] = [];
		server.use(http.post(`${apiUrl}/submissions`, async ({ request }) => {
			requests.push(request);
			return HttpResponse.json({ report_id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', replay: false, request_hash: 'cmVxdWVzdA' });
		}));
		render(Form, {
			shiftId: draftFixture.shift_id,
			draft: {
				...draftFixture,
				sales: [],
				losses: [],
				readings: [{ row_id: 'row-1', nozzle_id: 'nozzle-1', meter_start: '100.0', meter_end: '125.0' }],
				nozzles: [{ nozzle_id: 'nozzle-1', label: 'N-01', meter_max: '100000' }]
			}
		});

		await fireEvent.click(await screen.findByRole('button', { name: 'Kirim shift' }));
		await fireEvent.click(screen.getByRole('button', { name: 'Konfirmasi kirim' }));
		await waitFor(() => expect(screen.getByText('Menunggu konfirmasi')).toBeInTheDocument());
		expect(requests).toHaveLength(1);
		expect(await requests[0].clone().json()).toMatchObject({
			station_id: draftFixture.station_id,
			shift_id: draftFixture.shift_id,
			draft_id: draftFixture.draft_id,
			payload: { readings: [{ nozzle_id: 'nozzle-1', meter_start: '100.0', meter_end: '125.0' }] }
		});
		expect(requests[0].headers.get('Idempotency-Key')).toBeTruthy();
	});

	it('raises the unsaved-edits flag while the draft is open and clears it after submit', async () => {
		setUnsavedShiftEdits(false);
		render(Form, {
			shiftId: draftFixture.shift_id,
			draft: {
				...draftFixture,
				sales: [],
				losses: [],
				readings: [{ row_id: 'row-1', nozzle_id: 'nozzle-1', meter_start: '100.0', meter_end: '125.0' }],
				nozzles: [{ nozzle_id: 'nozzle-1', label: 'N-01', meter_max: '100000' }]
			}
		});

		await waitFor(() => expect(hasUnsavedShiftEdits()).toBe(true));

		await fireEvent.click(screen.getByRole('button', { name: 'Kirim shift' }));
		await fireEvent.click(screen.getByRole('button', { name: 'Konfirmasi kirim' }));
		await waitFor(() => expect(screen.getByText('Menunggu konfirmasi')).toBeInTheDocument());
		expect(hasUnsavedShiftEdits()).toBe(false);
	});
});
