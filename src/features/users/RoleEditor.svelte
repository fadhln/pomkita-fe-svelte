<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { ApiError } from '$lib/api/client';
	import { addUserRole, removeUserRole, type UserDetail } from './api';

	let { user, stationIds, roleOptions }: { user: UserDetail; stationIds: string[]; roleOptions: string[] } = $props();
	let role = $state('');
	let stationId = $state('');
	let pending = $state(false);
	let errorMessage = $state('');
	$effect(() => {
		if (!role && roleOptions.length) role = roleOptions[0];
		if (!stationId && stationIds.length) stationId = stationIds[0];
	});

	function errorText(cause: unknown) { return cause instanceof ApiError ? cause.body.message : 'Peran tidak dapat diubah.'; }

	async function addRole() {
		pending = true; errorMessage = '';
		try { await addUserRole(user.id, { station_id: stationId.trim(), role }); await invalidateAll(); }
		catch (cause) { errorMessage = errorText(cause); }
		finally { pending = false; }
	}

	async function removeRole(roleName: string, roleStationId: string) {
		pending = true; errorMessage = '';
		try { await removeUserRole(user.id, { station_id: roleStationId, role: roleName }); await invalidateAll(); }
		catch (cause) { errorMessage = errorText(cause); }
		finally { pending = false; }
	}
</script>

<section class="panel" aria-labelledby="role-editor-title">
	<h2 id="role-editor-title">Peran pengguna</h2>
	<p class="hint">Perubahan peran tunduk pada aturan layanan. Penghapusan Owner terakhir dapat ditolak oleh layanan.</p>
	{#if errorMessage}<p class="error" role="alert">{errorMessage}</p>{/if}
	<ul>{#each user.roles as item}<li><span><strong>{item.role}</strong> · {item.station_name ?? item.station_id}</span><button class="secondary" type="button" disabled={pending} onclick={() => void removeRole(item.role, item.station_id)}>Hapus</button></li>{:else}<li class="empty">Belum ada peran.</li>{/each}</ul>
	<div class="add-role"><label for="role-name">Peran<select id="role-name" bind:value={role} disabled={pending}>{#each roleOptions as roleOption}<option value={roleOption}>{roleOption}</option>{/each}</select></label><label for="role-station">Stasiun<input id="role-station" bind:value={stationId} list="role-stations" disabled={pending} /></label><datalist id="role-stations">{#each stationIds as id}<option value={id}>{id}</option>{/each}</datalist><button type="button" disabled={pending || !stationId.trim() || !role} onclick={() => void addRole()}>Tambah peran</button></div>
</section>

<style>
	.panel { display: grid; gap: var(--space-3); padding: var(--space-4); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
	h2, p { margin: 0; } h2 { font-size: 1.05rem; } .hint, .empty { color: var(--color-text-muted); font-size: .85rem; } .error { color: var(--color-danger); font-weight: 700; }
	ul { display: grid; gap: var(--space-2); margin: 0; padding: 0; list-style: none; } li { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); padding: var(--space-2) 0; border-top: 1px solid var(--color-border); }
	.add-role { display: grid; grid-template-columns: 1fr 1fr auto; gap: var(--space-3); align-items: end; } label { display: grid; gap: var(--space-1); font-size: .8rem; font-weight: 700; } input, select { width: 100%; min-height: 2.6rem; padding: .45rem .65rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-surface); color: var(--color-text); }
	button { min-height: 2.6rem; padding: .45rem .8rem; border: 1px solid var(--color-primary); border-radius: var(--radius-sm); background: var(--color-primary); color: var(--color-surface); font-weight: 700; cursor: pointer; } button.secondary { border-color: var(--color-border); background: var(--color-surface); color: var(--color-primary); }
	@media (max-width: 42rem) { .add-role { grid-template-columns: 1fr; } }
</style>
