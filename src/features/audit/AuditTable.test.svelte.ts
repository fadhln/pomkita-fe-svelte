import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import AuditTable from './AuditTable.svelte';

describe('audit table', () => {
	it('extracts station and actor from the base64 payload', () => {
		const payload = btoa(JSON.stringify({ station_id: 'station-1', actor_user_id: 'owner-1' }));
		render(AuditTable, { rows: [{ event_id: 'e', org_sequence: 4, event_type: 'policy.revision.created', payload, outcome: 'success', created_at: '2026-09-01T00:00:00Z', prev_hash: '', row_hash: '' }] });
		expect(screen.getByText('station-1')).toBeInTheDocument(); expect(screen.getByText('owner-1')).toBeInTheDocument();
	});
});
