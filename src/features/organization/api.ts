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

export function getOrganizations() {
	return apiFetch<Organization[]>('/organizations').then((organizations) => organizations ?? []);
}

export function getOrganization(id: string) {
	return apiFetch<Organization>(`/organizations/${encodeURIComponent(id)}`);
}

export function createOrganization(input: OrganizationCreateInput) {
	return apiFetch<Organization>('/organizations', { method: 'POST', body: JSON.stringify(input) });
}

export function updateOrganization(id: string, input: OrganizationInput) {
	return apiFetch<Organization>(`/organizations/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(input) });
}

export function disableOrganization(id: string) {
	return apiFetch<void>(`/organizations/${encodeURIComponent(id)}/disable`, { method: 'POST' });
}
