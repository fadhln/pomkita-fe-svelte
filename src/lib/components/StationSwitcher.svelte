<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { activeStationForSession, permittedStations, setActiveStationCookie, type StationOption } from '$lib/station/active';

	type StationSession = { station_ids?: string[] | null };
	let { session, activeStationId, stations = [] }: { session?: StationSession | null; activeStationId?: string; stations?: StationOption[] } = $props();
	let selectedStationId = $state('');
	let stationOptions = $derived(permittedStations(session, stations));
	let hasMultipleStations = $derived(stationOptions.length > 1);

	$effect(() => {
		selectedStationId = activeStationForSession(session, activeStationId);
	});

	async function handleStationChange(event: Event) {
		const nextStationId = (event.currentTarget as HTMLSelectElement).value;
		if (!stationOptions.some((station) => station.id === nextStationId) || nextStationId === selectedStationId) return;
		if (window.location.pathname.startsWith('/shift/') && !window.confirm('Perubahan yang belum disimpan akan hilang. Ganti stasiun?')) {
			selectedStationId = activeStationForSession(session, activeStationId);
			return;
		}
		setActiveStationCookie(nextStationId);
		selectedStationId = nextStationId;
		await invalidateAll();
	}
</script>

{#if hasMultipleStations}
	<label class="station-switcher" for="active-station">Stasiun aktif<select id="active-station" aria-label="Stasiun aktif" value={selectedStationId} onchange={handleStationChange}>{#each stationOptions as station (station.id)}<option value={station.id}>{station.name || station.id}</option>{/each}</select></label>
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
</style>
