<script lang="ts">
	import UserPage from '../../../features/users/UserPage.svelte';
	import type { UserSummary } from '../../../features/users/api';

	let { data }: { data: { users: UserSummary[]; isOwner: boolean; isSuperadmin: boolean; authorized?: boolean; stationIds: string[] } } = $props();
</script>

<svelte:head><title>Pengguna | PomKita</title></svelte:head>
<UserPage {...data} />
