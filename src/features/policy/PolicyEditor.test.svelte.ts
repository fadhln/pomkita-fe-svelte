import { fireEvent, render, screen } from '@testing-library/svelte';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { apiUrl } from '../../../test/mocks/handlers';
import { server } from '../../../test/mocks/server';
import PolicyEditor from './PolicyEditor.svelte';

const revision = { revision_id: 'revision-1', policy_id: 'policy-1', policy_kind: 'threshold', station_id: 'station-1', valid_from: '2026-09-01T00:00:00Z', disabled: false, loss_liter_threshold: '10.00', gain_liter_threshold: '10.00', loss_rupiah_threshold: '0', gain_rupiah_threshold: '0', variance_rupiah_threshold: '0', rollover_threshold: '0.0' };
describe('policy editor', () => {
	it('posts a contract-shaped tombstone revision with a reason', async () => {
		let body: Record<string, unknown> | undefined;
		server.use(http.post(`${apiUrl}/policies/revisions`, async ({ request }) => { body = await request.json() as Record<string, unknown>; return HttpResponse.json({ revision_id: 'revision-2', policy_id: 'policy-1', policy_kind: 'threshold', valid_from: '2026-09-02T00:00:00Z', disabled: true }); }));
		render(PolicyEditor, { revisions: [revision], stationId: 'station-1' });
		await fireEvent.click(screen.getByRole('button', { name: 'Nonaktifkan' })); await fireEvent.input(screen.getByLabelText('Alasan penonaktifan'), { target: { value: 'Diganti' } }); await fireEvent.click(screen.getByRole('button', { name: 'Konfirmasi nonaktifkan' }));
		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(body).toMatchObject({ policy_id: 'policy-1', station_id: 'station-1', disabled: true, tombstone_reason: 'Diganti', supersedes_revision_id: 'revision-1', loss_liter_threshold: '10.00' });
	});
});
