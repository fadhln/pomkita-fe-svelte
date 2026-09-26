<script lang="ts">
	import { hasRole, type Session } from '$lib/session/api';
	import type { Organization } from '../../features/organization/api';

	let { session, organizations = [] }: { session?: Session | null; organizations?: Organization[] } = $props();
	let enabledOrganizations = $derived(organizations.filter((organization) => organization.enabled).toSorted((a, b) => a.name.localeCompare(b.name)));
	let selectedOrganizationId = $derived(session?.active_context?.org_id ?? session?.org_id ?? '');
	let isSuperadmin = $derived(hasRole(session?.roles, 'Superadmin'));
</script>

{#if isSuperadmin}
	<label class="organization-switcher" for="active-organization">Organisasi aktif<select id="active-organization" aria-label="Organisasi aktif" value={selectedOrganizationId}>{#each enabledOrganizations as organization (organization.id)}<option value={organization.id}>{organization.name}</option>{/each}</select></label>
{/if}

<style>
	.organization-switcher {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		color: var(--color-text-muted);
		font-size: 0.72rem;
		font-weight: 700;
	}

	.organization-switcher select {
		min-height: 2.2rem;
		width: auto;
		max-width: 13rem;
		padding: var(--space-1) var(--space-2);
	}
</style>
