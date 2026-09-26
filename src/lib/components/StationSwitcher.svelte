<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { ApiError } from '$lib/api/client';
	import { hasRole } from '$lib/session/api';
	import { setActiveContext } from '$lib/session/activeContext';
	import { activeStationForSession, permittedStations, setActiveStationCookie, clearActiveStationCookie, type StationOption } from '$lib/station/active';
	import { hasUnsavedShiftEdits, onUnsavedShiftEditsChange } from '$lib/session/unsaved';

	type StationSession = { station_ids?: string[] | null; roles?: string[] | null; org_id?: string; active_context?: { org_id: string; station_id: string } | null };
	let { session, activeStationId, stations = [] }: { session?: StationSession | null; activeStationId?: string; stations?: StationOption[] } = $props();
	let selectedStationId = $state('');
	let isSuperadmin = $derived(hasRole(session?.roles, 'Superadmin'));
	let stationOptions = $derived(isSuperadmin ? permittedStations(session, stations, 'organization') : permittedStations(session, stations));
	let hasMultipleStations = $derived(stationOptions.length > 1);
	let pending = $state(false);
	let error = $state('');
	let shiftEditsUnsaved = $state(false);
	$effect(() => onUnsavedShiftEditsChange(() => (shiftEditsUnsaved = hasUnsavedShiftEdits())));

	$effect(() => {
		selectedStationId = activeStationForSession(session, activeStationId);
	});

	async function handleStationChange(event: Event) {
		const nextStationId = (event.currentTarget as HTMLSelectElement).value;
		const serverStationId = activeStationForSession(session, activeStationId);
		if (!stationOptions.some((station) => station.id === nextStationId) || nextStationId === serverStationId) return;
		if (shiftEditsUnsaved && !window.confirm('Perubahan shift yang belum disimpan akan hilang. Ganti konteks?')) {
			selectedStationId = serverStationId;
			return;
		}
		if (isSuperadmin) {
			error = '';
			pending = true;
			const activeOrgId = session?.active_context?.org_id ?? session?.org_id ?? '';
			try {
				await setActiveContext(activeOrgId, nextStationId);
				// Server active_context owns the station selection for superadmins.
				clearActiveStationCookie();
				await invalidateAll();
			} catch (cause) {
				selectedStationId = serverStationId;
				error = cause instanceof ApiError && cause.status === 404 ? 'Stasiun tidak ditemukan' : 'Tidak dapat mengganti stasiun';
			} finally {
				pending = false;
			}
			return;
		}
		setActiveStationCookie(nextStationId);
		selectedStationId = nextStationId;
		await invalidateAll();
	}
</script>

{#if hasMultipleStations}
	<label class="station-switcher" for="active-station">Stasiun aktif<select id="active-station" aria-label="Stasiun aktif" bind:value={selectedStationId} onchange={handleStationChange} disabled={pending}>{#each stationOptions as station (station.id)}<option value={station.id}>{station.name || station.id}</option>{/each}</select></label>
	{#if error}<span class="station-error" role="alert">{error}</span>{/if}
{:else if stationOptions.length === 1}
	<span class="station-name">{stationOptions[0].name || stationOptions[0].id}</span>
{/if}

<style>
	.station-switcher {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		color: var(--color-text-muted);
		font-size: 0.72rem;
		font-weight: 700;
	}

	.station-switcher select {
		min-height: 2.2rem;
		width: auto;
		max-width: 13rem;
		padding: var(--space-1) var(--space-2);
	}

	.station-name {
		color: var(--color-text-muted);
		font-size: 0.8rem;
		font-weight: 700;
	}

	.station-error {
		color: var(--color-danger, #b42318);
		font-size: 0.72rem;
	}
</style>
