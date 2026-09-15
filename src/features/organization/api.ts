import { apiFetch } from '$lib/api/client';

export type Organization = {
	id: string;
	name: string;
	legal_name: string;
	address: string;
	contact_email: string;
	timezone: string;
	enabled: boolean;
};

export type OrganizationInput = Omit<Organization, 'id' | 'enabled'> & { enabled?: boolean };
export type OrganizationCreateInput = Omit<OrganizationInput, 'enabled'> & {
	first_station: { name: string; timezone: string };
};

function record(value: unknown): Record<string, unknown> {
	return typeof value === 'object' && value !== null ? value as Record<string, unknown> : {};
}

function organizationView(value: unknown): Organization {
	const source = record(value);
	return {
		id: String(source.org_id ?? source.id ?? ''),
		name: String(source.name ?? ''),
		legal_name: String(source.legal_name ?? ''),
		address: String(source.address ?? ''),
		contact_email: String(source.contact_email ?? ''),
		timezone: String(source.timezone ?? ''),
		enabled: Boolean(source.enabled)
	};
}

export function getOrganizations() {
	return apiFetch<unknown>('/organizations').then((organizations) => (Array.isArray(organizations) ? organizations : []).map(organizationView));
}

export function getOrganization(id: string) {
	return apiFetch<unknown>(`/organizations/${encodeURIComponent(id)}`).then(organizationView);
}

export function createOrganization(input: OrganizationCreateInput) {
	return apiFetch<unknown>('/organizations', { method: 'POST', body: JSON.stringify(input) }).then(organizationView);
}

export function updateOrganization(id: string, input: OrganizationInput) {
	return apiFetch<unknown>(`/organizations/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(input) }).then(organizationView);
}

export function disableOrganization(id: string) {
	return apiFetch<void>(`/organizations/${encodeURIComponent(id)}/disable`, { method: 'POST' });
}
