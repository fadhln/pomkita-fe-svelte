<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { ApiError } from '$lib/api/client';
	import FieldError from '$lib/components/FieldError.svelte';
	import { getRoleHistory, getUser, resetUserPassword, updateUser, type RoleHistoryEvent, type UserDetail as UserDetailType, type UserSummary } from './api';
	import RoleEditor from './RoleEditor.svelte';
	import RoleHistory from './RoleHistory.svelte';

	let { user, isOwner, stationIds, onback }: { user: UserSummary; isOwner: boolean; stationIds: string[]; onback: () => void } = $props();
	let detail = $state<UserDetailType>();
	let history = $state<RoleHistoryEvent[]>([]);
	let loading = $state(true);
	let requestError = $state('');
	let form = $state({ displayName: '', enabled: false });
	let pending = $state(false);
	let success = $state('');
	let fieldError = $state('');
	let resetLink = $state('');
	let loadedId = $state('');

	const privileged = $derived(user.roles.some((item) => ['Owner', 'Superadmin'].includes(item.role)));
	const canEdit = $derived(!(isOwner && privileged));
	const roleOptions = $derived(isOwner ? ['Operator', 'Supervisor', 'Station Admin'] : ['Operator', 'Supervisor', 'Station Admin', 'Owner']);

	function errorText(cause: unknown) { return cause instanceof ApiError ? cause.body.message : 'Permintaan tidak dapat diproses.'; }

	$effect(() => {
		if (loadedId === user.id) return;
		loadedId = user.id; loading = true; requestError = '';
		void Promise.all([getUser(user.id), getRoleHistory(user.id)]).then(([value, events]) => { detail = value; history = events; form.displayName = value.display_name; form.enabled = value.enabled; }).catch((cause) => (requestError = errorText(cause))).finally(() => (loading = false));
	});

	async function save() {
		pending = true; success = ''; fieldError = '';
		try { const value = await updateUser(user.id, { display_name: form.displayName.trim(), enabled: form.enabled }); detail = value; await invalidateAll(); success = 'Perubahan pengguna disimpan.'; }
		catch (cause) { if (cause instanceof ApiError) fieldError = cause.body.field_errors?.display_name ?? cause.body.field_errors?.['body.display_name'] ?? errorText(cause); else fieldError = errorText(cause); }
		finally { pending = false; }
	}

	async function passwordReset() {
		pending = true; success = ''; resetLink = '';
		try { resetLink = (await resetUserPassword(user.id)).link; await invalidateAll(); }
		catch (cause) { fieldError = errorText(cause); }
		finally { pending = false; }
	}
</script>

<section class="detail" aria-labelledby="user-detail-title">
	<button class="back" type="button" onclick={onback}>← Kembali ke pengguna</button>
	{#if loading}<p role="status">Memuat detail pengguna…</p>{:else if requestError}<p class="error" role="alert">{requestError}</p>{:else if detail}
		<header><p class="overline">Detail pengguna</p><h2 id="user-detail-title">{detail.display_name}</h2><p>{detail.email} · {detail.username ?? 'Belum diaktifkan'}</p></header>
		{#if !canEdit}<p class="notice" role="note">Owner tidak dapat mengubah pengguna Owner atau Superadmin.</p>{/if}
		{#if fieldError}<p class="error" role="alert">{fieldError}</p>{/if}{#if success}<p class="success" role="status">{success}</p>{/if}
		{#if canEdit}<form class="panel form" onsubmit={(event) => { event.preventDefault(); void save(); }} aria-busy={pending}><h3>Informasi pengguna</h3><label for="detail-display-name">Nama lengkap<input id="detail-display-name" bind:value={form.displayName} disabled={pending} /></label><label class="check" for="detail-enabled"><input id="detail-enabled" type="checkbox" bind:checked={form.enabled} disabled={pending} /> Akun aktif</label><button type="submit" disabled={pending}>Simpan perubahan</button></form>{/if}
		{#if canEdit}<RoleEditor {stationIds} {roleOptions} user={detail} />{/if}
		<section class="panel"><h3>Stasiun</h3>{#if detail.stations.length}<ul>{#each detail.stations as station}<li>{station.name ?? station.id}</li>{/each}</ul>{:else}<p class="muted">Belum ada stasiun.</p>{/if}</section>
		{#if canEdit}<section class="panel reset"><h3>Reset kata sandi</h3><p class="muted">Layanan membuat tautan reset satu kali.</p><button type="button" disabled={pending} onclick={() => void passwordReset()}>Kirim tautan reset</button>{#if resetLink}<p class="warning" role="alert">Tautan ini hanya ditampilkan satu kali: <a href={resetLink}>{resetLink}</a></p><p class="warning">Tautan tidak akan ditampilkan lagi.</p>{/if}</section>{/if}
		<RoleHistory events={history} />
	{/if}
</section>

<style>
	.detail { display: grid; gap: var(--space-4); } .back { width: fit-content; border: 0; padding: 0; background: transparent; color: var(--color-primary); } header { display: grid; gap: var(--space-1); } h2, h3, header p { margin: 0; } h2 { font-size: 1.6rem; } header p:last-child, .muted { color: var(--color-text-muted); }
	.panel { display: grid; gap: var(--space-3); padding: var(--space-4); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); } .form label { display: grid; gap: var(--space-1); font-size: .8rem; font-weight: 700; } input { min-height: 2.6rem; padding: .45rem .65rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-surface); color: var(--color-text); } .check { display: flex !important; align-items: center; } .check input { width: auto; min-height: auto; }
	.notice { margin: 0; padding: var(--space-3); background: var(--color-primary-soft); border: 1px solid var(--color-border); border-radius: var(--radius-sm); } .error { color: var(--color-danger); font-weight: 700; } .success { color: var(--color-success); font-weight: 700; } .warning { color: var(--color-warning); font-weight: 700; overflow-wrap: anywhere; } a { color: var(--color-primary); } ul { margin: 0; padding-left: 1.2rem; } button { width: fit-content; min-height: 2.6rem; padding: .45rem .8rem; border: 1px solid var(--color-primary); border-radius: var(--radius-sm); background: var(--color-primary); color: var(--color-surface); font-weight: 700; cursor: pointer; }
</style>
