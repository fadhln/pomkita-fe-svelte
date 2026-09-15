<script lang="ts">
	import OrganizationPage from '../../features/organization/OrganizationPage.svelte';
	import type { Organization } from '../../features/organization/api';
	let { data }: { data: { organizations: Organization[]; isOwner: boolean; isSuperadmin: boolean; authorized?: boolean } } = $props();
</script>

<OrganizationPage {...data} />
