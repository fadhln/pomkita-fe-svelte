import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import AnomalyList from './AnomalyList.svelte';

const anomaly = { event_id: 'event-1', event_type: 'fired', rule_id: 'rule-1', source_id: 'ack-1', source_kind: 'break_glass', source_version_no: 2, station_id: '33333333-3333-4333-8333-333333333333', subject_id: 'report-1', subject_kind: 'report', happened_at: '2026-09-13T04:00:00.000Z' };

describe('AnomalyList', () => {
	it('shows the immutable anomaly fields and UTC date', () => {
		render(AnomalyList, { anomalies: [anomaly] });

		expect(screen.getByText('Break-glass')).toBeInTheDocument();
		expect(screen.getByText('report-1')).toBeInTheDocument();
		expect(screen.getByText('13 Sep 2026, 04.00')).toBeInTheDocument();
		expect(screen.getByText('2')).toBeInTheDocument();
	});

	it('shows an empty state', () => {
		render(AnomalyList, { anomalies: [] });
		expect(screen.getByText('Belum ada anomali.')).toBeInTheDocument();
	});
});
