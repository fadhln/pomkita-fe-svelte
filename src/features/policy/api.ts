import { apiFetch } from '$lib/api/client';

export type PolicyRevision = {
	revision_id: string; policy_id: string; policy_kind: string; station_id?: string; valid_from: string; disabled: boolean;
	tombstone_reason?: string; loss_liter_threshold?: string; gain_liter_threshold?: string; loss_rupiah_threshold?: string;
	gain_rupiah_threshold?: string; variance_rupiah_threshold?: string; rollover_threshold?: string; evidence_mode?: string;
};
export type PolicyRevisionRequest = {
	policy_kind: string; policy_id: string; station_id: string; valid_from: string; supersedes_revision_id: string; disabled: boolean; tombstone_reason: string;
	loss_liter_threshold: string; gain_liter_threshold: string; loss_rupiah_threshold: string; gain_rupiah_threshold: string;
	variance_rupiah_threshold: string; rollover_threshold: string; evidence_mode: string;
};

export function getPolicyHistory(stationId: string) {
	return apiFetch<PolicyRevision[] | null>(`/policies/history?station_id=${encodeURIComponent(stationId)}`).then((rows) => rows ?? []);
}
export function createPolicyRevision(input: PolicyRevisionRequest) {
	return apiFetch<PolicyRevision>('/policies/revisions', { method: 'POST', body: JSON.stringify(input) });
}

export function requestFromRevision(revision: PolicyRevision, stationId: string, changes: Partial<PolicyRevisionRequest> = {}): PolicyRevisionRequest {
	return {
		policy_kind: revision.policy_kind, policy_id: revision.policy_id, station_id: stationId, valid_from: revision.valid_from,
		supersedes_revision_id: revision.revision_id, disabled: revision.disabled, tombstone_reason: revision.tombstone_reason ?? '',
		loss_liter_threshold: revision.loss_liter_threshold ?? '', gain_liter_threshold: revision.gain_liter_threshold ?? '',
		loss_rupiah_threshold: revision.loss_rupiah_threshold ?? '', gain_rupiah_threshold: revision.gain_rupiah_threshold ?? '',
		variance_rupiah_threshold: revision.variance_rupiah_threshold ?? '', rollover_threshold: revision.rollover_threshold ?? '', evidence_mode: revision.evidence_mode ?? '', ...changes
	};
}
