<script lang="ts">
	import type { Account } from './api';
	import AccountPasswordForm from './AccountPasswordForm.svelte';
	import AccountProfile from './AccountProfile.svelte';

	let { account }: { account: Account } = $props();
	function copyAccount(value: Account): Account {
		return { ...value, org: { ...value.org }, roles: [...value.roles], stations: [...value.stations] };
	}
	let currentAccount = $state<Account | undefined>();
	$effect(() => {
		currentAccount = copyAccount(account);
	});

	function updateAccount(updated: Account) {
		currentAccount = updated;
	}
</script>

<section class="page" aria-labelledby="account-title">
	<header class="page-header">
		<p class="overline">Pengaturan pribadi</p>
		<h1 id="account-title">Akun</h1>
		<p>Kelola informasi profil dan keamanan akun Anda.</p>
	</header>

	<div class="grid">
		{#if currentAccount}<AccountProfile account={currentAccount} onupdated={updateAccount} />{/if}
		<AccountPasswordForm />
	</div>
</section>

<style>
	.page-header { display: grid; gap: var(--space-2); }
	.page-header p, h1 { margin: 0; }
	.page-header > p:last-child { color: var(--color-text-muted); }
	.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr)); gap: var(--space-4); align-items: start; }
</style>
