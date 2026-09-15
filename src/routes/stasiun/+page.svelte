<script lang="ts">
	import StationPage from '../../features/station/StationPage.svelte';
	import type { Station } from '../../features/station/api';
	let { data }: { data: { stations: Station[]; isOwner: boolean; isSuperadmin: boolean; authorized?: boolean } } = $props();
</script>

<StationPage {...data} />
