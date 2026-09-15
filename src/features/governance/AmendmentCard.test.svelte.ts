import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { apiUrl } from '../../../test/mocks/handlers';
import { server } from '../../../test/mocks/server';
import AmendmentCard from './AmendmentCard.svelte';

const navigation = vi.hoisted(() => ({ invalidateAll: vi.fn().mockResolvedValue(undefined) }));
vi.mock('$app/navigation', () => navigation);

const amendment = {
	AmendmentID: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
	StationID: '33333333-3333-4333-8333-333333333333',
	ShiftID: '44444444-4444-4444-8444-444444444444',
	BaseReportID: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
	BaseVersionNo: 2,
	Status: 'pending',
	Requester: { UserID: '11111111-1111-4111-8111-111111111111', DisplayName: 'Siti Supervisor' },
	Reason: 'Koreksi setoran',
	RequestedAt: '2026-09-13T04:00:00.000Z',
	StaleCheckHash: 'ab'.repeat(32),
	Items: [{ ItemID: 'item-1', TargetKind: 'sales_declared', TargetLogicalID: 'sale-1', Field: 'cash_amount', OldValue: '"2000"', NewValue: '"2500"' }]
};

const session = { user_id: '99999999-9999-4999-8999-999999999999', display_name: 'Admin', roles: ['Station Admin'], org_id: 'org-1', station_ids: [amendment.StationID] };

describe('AmendmentCard', () => {
	it('shows requester and sends the exact queue hash when approving', async () => {
		let body: Record<string, unknown> | undefined;
		server.use(http.post(`${apiUrl}/amendments/${amendment.AmendmentID}/approve`, async ({ request }) => {
			body = (await request.json()) as Record<string, unknown>;
			return HttpResponse.json({ AmendmentID: amendment.AmendmentID });
		}));
		render(AmendmentCard, { amendment, session });

		expect(screen.getByText('Siti Supervisor')).toBeInTheDocument();
		expect(screen.getByText('Rp2.000 → Rp2.500')).toBeInTheDocument();
		await fireEvent.click(screen.getByRole('button', { name: 'Setujui' }));
		await waitFor(() => expect(screen.getByText('Amendemen disetujui.')).toBeInTheDocument());
		expect(body).toEqual({ station_id: amendment.StationID, stale_check_hash: amendment.StaleCheckHash });
		expect(navigation.invalidateAll).toHaveBeenCalled();
	});

	it('blocks the requester and requires a rejection reason', async () => {
		render(AmendmentCard, { amendment, session: { ...session, user_id: amendment.Requester.UserID } });

		expect(screen.getByText('Pemohon tidak dapat menjadi penyetuju.')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Setujui' })).toBeDisabled();
		await fireEvent.click(screen.getByRole('button', { name: 'Tolak' }));
		await fireEvent.click(screen.getByRole('button', { name: 'Kirim penolakan' }));
		expect(screen.getByText('Alasan penolakan wajib diisi.')).toBeInTheDocument();
	});
});
