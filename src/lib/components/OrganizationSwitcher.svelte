<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { ApiError } from '$lib/api/client';
	import { clearActiveStationCookie } from '$lib/station/active';
	import { hasRole, type Session } from '$lib/session/api';
	import { setActiveContext } from '$lib/session/activeContext';
	import type { Organization } from '../../features/organization/api';
	import { getStations } from '../../features/station/api';

	let { session, organizations = [], onchanged }: { session?: { roles?: string[] | null; org_id?: string; active_context?: Session['active_context'] } | null; organizations?: Organization[]; onchanged?: () => void } = $props();
	let enabledOrganizations = $derived(organizations.filter((organization) => organization.enabled).toSorted((a, b) => a.name.localeCompare(b.name)));
	let selectedOrganizationId = $state('');
	let activeOrganizationId = $derived(session?.active_context?.org_id ?? session?.org_id ?? '');
	$effect(() => { selectedOrganizationId = activeOrganizationId; });
	let isSuperadmin = $derived(hasRole(session?.roles, 'Superadmin'));
	let pending = $state(false);
	let error = $state('');

	async function handleOrganizationChange(event: Event) {
		const orgId = (event.currentTarget as HTMLSelectElement).value;
		if (!enabledOrganizations.some((organization) => organization.id === orgId) || orgId === activeOrganizationId) return;
		error = '';
		pending = true;
		try {
			const stations = await getStations(orgId);
			const firstEnabledStation = stations.find((station) => station.enabled);
			if (!firstEnabledStation) {
				selectedOrganizationId = session?.active_context?.org_id ?? session?.org_id ?? '';
				error = 'Tidak ada stasiun aktif';
				return;
			}
			await setActiveContext(orgId, firstEnabledStation.id);
			// Server active_context owns the station selection for superadmins.
			clearActiveStationCookie();
			await invalidateAll();
			onchanged?.();
		} catch (cause) {
			selectedOrganizationId = session?.active_context?.org_id ?? session?.org_id ?? '';
			if (cause instanceof ApiError && (cause.status === 403 || cause.status === 404)) {
				error = cause.status === 404 ? 'Organisasi atau stasiun tidak ditemukan' : 'Tidak dapat mengganti organisasi';
			} else {
				error = 'Tidak dapat mengganti organisasi';
			}
		} finally {
			pending = false;
		}
	}
</script>

{#if isSuperadmin}
	<div class="organization-control">
		<label class="organization-switcher" for="active-organization">Organisasi aktif<select id="active-organization" aria-label="Organisasi aktif" bind:value={selectedOrganizationId} onchange={handleOrganizationChange} disabled={pending}>{#each enabledOrganizations as organization (organization.id)}<option value={organization.id}>{organization.name}</option>{/each}</select></label>
		{#if error}<span class="organization-error" role="alert">{error}</span>{/if}
	</div>
{/if}

<style>
	.organization-control { display: flex; flex-direction: column; gap: 0.2rem; }
	.organization-switcher {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		color: var(--color-text-muted);
		font-size: 0.72rem;
		font-weight: 700;
	}
	.organization-switcher select { min-height: 2.2rem; width: auto; max-width: 13rem; padding: var(--space-1) var(--space-2); }
	.organization-error { color: var(--color-danger, #b42318); font-size: 0.72rem; }
</style>
