import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import OrganizationSwitcher from './OrganizationSwitcher.svelte';

const organizations = [
	{ id: 'org-z', name: 'Zulu', enabled: true },
	{ id: 'org-off', name: 'Disabled', enabled: false },
	{ id: 'org-a', name: 'Alpha', enabled: true }
] as never;

const session = { roles: ['Superadmin'], org_id: 'org-z', active_context: null } as never;

describe('OrganizationSwitcher', () => {
	it('is hidden for non-superadmins', () => {
		render(OrganizationSwitcher, { session: { ...session, roles: ['Owner'] }, organizations });
		expect(screen.queryByRole('combobox', { name: 'Organisasi aktif' })).not.toBeInTheDocument();
	});

	it('lists enabled organizations in name order for superadmins', () => {
		render(OrganizationSwitcher, { session, organizations });
		const options = screen.getAllByRole('option').map((option) => option.textContent);
		expect(options).toEqual(['Alpha', 'Zulu']);
		expect(screen.getByRole('combobox', { name: 'Organisasi aktif' })).toHaveValue('org-z');
	});
});
