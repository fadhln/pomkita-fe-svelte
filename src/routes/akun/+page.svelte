<script lang="ts">
	import AccountPage from '../../features/account/AccountPage.svelte';
	import type { Account } from '../../features/account/api';

	let { data }: { data: { account: Account } } = $props();
</script>

<svelte:head>
	<title>Akun | PomKita</title>
	<meta name="description" content="Kelola akun PomKita" />
</svelte:head>

<AccountPage account={data.account} />
