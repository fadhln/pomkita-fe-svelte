<script lang="ts">
	import OrganizationCard from './OrganizationCard.svelte';
	import OrganizationCreateForm from './OrganizationCreateForm.svelte';
	import type { Organization } from './api';

	let { organizations, isOwner, isSuperadmin, authorized = true }: { organizations: Organization[]; isOwner: boolean; isSuperadmin: boolean; authorized?: boolean } = $props();
</script>

<svelte:head><title>Organisasi | PomKita</title></svelte:head>
<section class="page" aria-labelledby="organization-title">
	<header><p class="overline">Administrasi</p><h1 id="organization-title">Organisasi</h1><p>Kelola data organisasi dan statusnya.</p></header>
	{#if !authorized}<section class="notice" role="status"><strong>Halaman tidak tersedia untuk peran Anda.</strong><span>Hanya Owner dan Superadmin yang dapat mengelola organisasi.</span></section>
	{:else}
		{#if isSuperadmin}<OrganizationCreateForm />{/if}
		<section class="list" aria-label="Daftar organisasi">
			{#if organizations.length}{#each organizations as organization (organization.id)}<OrganizationCard {organization} {isSuperadmin} />{/each}{:else}<p class="empty">Belum ada organisasi.</p>{/if}
		</section>
	{/if}
</section>

<style>
	.list { display: grid; gap: var(--space-6); } header { display: grid; gap: var(--space-2); } h1, header p { margin: 0; } h1 { font-size: 2rem; } header p:last-child { color: var(--color-text-muted); }
	.notice { display: grid; gap: var(--space-2); padding: var(--space-5); background: var(--color-primary-soft); border: 1px solid var(--color-border); border-radius: var(--radius-md); } .notice span, .empty { color: var(--color-text-muted); }
</style>
