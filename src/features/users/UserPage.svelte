<script lang="ts">
	import InviteUserForm from './InviteUserForm.svelte';
	import UserDetail from './UserDetail.svelte';
	import UserTable from './UserTable.svelte';
	import type { UserSummary } from './api';

	let { users, isOwner, isSuperadmin, authorized = true, stationIds }: { users: UserSummary[]; isOwner: boolean; isSuperadmin: boolean; authorized?: boolean; stationIds: string[] } = $props();
	let selectedUser = $state<UserSummary>();
	const roleOptions = $derived(isSuperadmin ? ['Operator', 'Supervisor', 'Station Admin', 'Owner'] : ['Operator', 'Supervisor', 'Station Admin']);
</script>

<svelte:head><title>Pengguna | PomKita</title><meta name="description" content="Kelola pengguna dan peran PomKita" /></svelte:head>
<section class="page" aria-labelledby="users-title">
	<header><p class="overline">Administrasi</p><h1 id="users-title">Pengguna dan peran</h1><p>Kelola undangan, akses pengguna, dan riwayat peran.</p></header>
	{#if !authorized}<section class="notice" role="status"><strong>Halaman tidak tersedia untuk peran Anda.</strong><span>Hanya Owner dan Superadmin yang dapat mengelola pengguna.</span></section>
	{:else if selectedUser}<UserDetail user={selectedUser} {isOwner} {stationIds} onback={() => (selectedUser = undefined)} />
	{:else}<InviteUserForm {roleOptions} {stationIds} /><UserTable {users} onselect={(user) => (selectedUser = user)} />{/if}
</section>

<style>
	.page { display: grid; gap: var(--space-6); } header { display: grid; gap: var(--space-2); } h1, header p { margin: 0; } h1 { font-size: 2rem; } .overline { color: var(--color-primary); font-size: .72rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; } header p:last-child { color: var(--color-text-muted); }
	.notice { display: grid; gap: var(--space-2); padding: var(--space-5); background: var(--color-primary-soft); border: 1px solid var(--color-border); border-radius: var(--radius-md); } .notice span { color: var(--color-text-muted); }
</style>
