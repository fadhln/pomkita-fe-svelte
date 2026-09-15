<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { ApiError } from '$lib/api/client';
	import { updateAccount, type Account, type AccountInput } from './api';

	let { account, onupdated }: { account: Account; onupdated: (account: Account) => void } = $props();
	function initialForm(value: Pick<Account, 'display_name' | 'username'>) {
		return { displayName: value.display_name, username: value.username };
	}
	let form = $state({ displayName: '', username: '' });
	$effect(() => {
		if (!form.displayName && !form.username) form = initialForm(account);
	});
	let pending = $state(false);
	let success = $state(false);
	let errorMessage = $state<string | undefined>();
	let fieldErrors = $state<Record<string, string>>({});

	function fieldError(field: string) {
		return fieldErrors[field] ?? fieldErrors[`body.${field}`];
	}

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		pending = true;
		success = false;
		errorMessage = undefined;
		fieldErrors = {};
		const input: AccountInput = { display_name: form.displayName.trim(), username: form.username.trim() };
		try {
			const updated = await updateAccount(input);
			await invalidateAll();
			form.displayName = updated.display_name;
			form.username = updated.username;
			onupdated(updated);
			success = true;
		} catch (cause) {
			if (cause instanceof ApiError && cause.status === 409) {
				fieldErrors = { username: 'Nama pengguna sudah digunakan.' };
			} else if (cause instanceof ApiError && cause.status === 422) {
				fieldErrors = cause.body.field_errors ?? {};
				errorMessage = cause.body.message;
			} else {
				errorMessage = 'Perubahan akun tidak dapat disimpan.';
			}
		} finally {
			pending = false;
		}
	}
</script>

<article class="card" aria-labelledby="profile-title">
	<h2 id="profile-title">Profil</h2>
	<dl>
		<div><dt>Email</dt><dd>{account.email}</dd></div>
		<div><dt>Nama pengguna</dt><dd>{account.username}</dd></div>
		<div><dt>Nama lengkap</dt><dd>{account.display_name}</dd></div>
		<div><dt>Organisasi</dt><dd>{account.org.name}</dd></div>
		<div><dt>Peran</dt><dd>{account.roles.length ? account.roles.join(', ') : 'Belum ada peran'}</dd></div>
		<div><dt>Stasiun</dt><dd>{account.stations.length ? account.stations.map((station) => typeof station === 'string' ? station : station.name ?? station.id).join(', ') : 'Belum ada stasiun'}</dd></div>
	</dl>

	<form onsubmit={submit} aria-busy={pending}>
		<h3>Ubah profil</h3>
		{#if errorMessage}<p class="error" role="alert">{errorMessage}</p>{/if}
		{#if success}<p class="success" role="status">Perubahan akun disimpan.</p>{/if}
		<label for="display-name">Nama lengkap<input id="display-name" name="display_name" autocomplete="name" bind:value={form.displayName} required disabled={pending} /></label>
		<label for="account-username">Nama pengguna<input id="account-username" name="username" autocomplete="username" bind:value={form.username} required disabled={pending} aria-invalid={Boolean(fieldError('username'))} /></label>
		{#if fieldError('username')}<p class="field-error">{fieldError('username')}</p>{/if}
		<button type="submit" disabled={pending}>{pending ? 'Menyimpan…' : 'Simpan perubahan'}</button>
	</form>
</article>

<style>
	.card { display: grid; gap: var(--space-4); padding: var(--space-5); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); box-shadow: var(--shadow-soft); }
	h2, h3, p { margin: 0; } h2 { font-size: 1.1rem; } h3 { font-size: .95rem; }
	dl { display: grid; gap: var(--space-3); margin: 0; }
	dl div { display: grid; gap: var(--space-1); } dt { color: var(--color-text-muted); font-size: .78rem; } dd { margin: 0; font-weight: 600; }
	form { display: grid; gap: var(--space-2); padding-top: var(--space-2); border-top: 1px solid var(--color-border); }
	label { display: grid; gap: var(--space-1); font-size: .8rem; font-weight: 700; } input { width: 100%; min-height: 2.6rem; padding: .45rem .65rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-surface); color: var(--color-text); }
	button { min-height: 2.6rem; padding: .45rem .8rem; border: 1px solid var(--color-primary); border-radius: var(--radius-sm); background: var(--color-primary); color: var(--color-surface); font-weight: 700; cursor: pointer; } button:disabled { cursor: wait; opacity: .6; }
	.error, .field-error { color: var(--color-danger); font-size: .85rem; font-weight: 600; } .success { color: var(--color-success); font-weight: 700; }
</style>
