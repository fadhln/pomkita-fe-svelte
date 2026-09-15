<script lang="ts">
	import { goto } from '$app/navigation';
	import { ApiError } from '$lib/api/client';
	import { acceptInvitation, type InvitationInput } from './api';

	let { token }: { token: string } = $props();
	let username = $state('');
	let password = $state('');
	let displayName = $state('');
	let pending = $state(false);
	let invalidToken = $state(false);
	let success = $state(false);
	let errorMessage = $state<string | undefined>();
	let fieldErrors = $state<Record<string, string>>({});
	let hasToken = $derived(Boolean(token.trim()));
	const usernamePattern = /^[a-z0-9._-]{3,32}$/;

	function fieldError(field: string) {
		return fieldErrors[field] ?? fieldErrors[`body.${field}`];
	}

	function clearUsernameValidity(event: Event) {
		(event.currentTarget as HTMLInputElement).setCustomValidity('');
	}

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (!hasToken || invalidToken || pending) return;
		const usernameInput = (event.currentTarget as HTMLFormElement).elements.namedItem('username') as HTMLInputElement;
		if (!usernamePattern.test(username)) {
			usernameInput.setCustomValidity('Gunakan 3–32 karakter yang diizinkan.');
			return;
		}
		usernameInput.setCustomValidity('');
		pending = true;
		errorMessage = undefined;
		fieldErrors = {};
		const input: InvitationInput = { token, username, password, display_name: displayName.trim() };
		try {
			await acceptInvitation(input);
			success = true;
			await goto('/masuk');
		} catch (cause) {
			if (cause instanceof ApiError && cause.status === 400 && cause.body.code === 'invalid_token') {
				invalidToken = true;
				errorMessage = 'Tautan tidak valid atau sudah dipakai.';
			} else if (cause instanceof ApiError && cause.status === 422) {
				fieldErrors = cause.body.field_errors ?? {};
				errorMessage = cause.body.message;
			} else {
				errorMessage = 'Akun tidak dapat diaktifkan.';
			}
		} finally {
			pending = false;
		}
	}
</script>

<section class="card" aria-labelledby="activation-title">
	<h1 id="activation-title">Aktivasi akun</h1>
	<p class="description">Buat nama pengguna dan kata sandi untuk mulai menggunakan PomKita.</p>
	{#if !hasToken}
		<p class="error" role="alert">Tautan aktivasi tidak memiliki token.</p>
	{:else if success}
		<p class="success" role="status">Akun berhasil diaktifkan. Silakan masuk.</p>
	{:else if invalidToken}
		<p class="error" role="alert">{errorMessage}</p>
	{:else}
		<form onsubmit={submit} aria-busy={pending}>
			{#if errorMessage}<p class="error" role="alert">{errorMessage}</p>{/if}
			<label for="activation-username">Nama pengguna</label>
			<input id="activation-username" name="username" type="text" autocomplete="username" bind:value={username} minlength="3" maxlength="32" pattern={'[a-z0-9._-]{3,32}'} required disabled={pending} aria-describedby="username-rules" oninput={clearUsernameValidity} />
			<small id="username-rules">3–32 karakter: huruf kecil, angka, titik, garis bawah, dan tanda hubung.</small>
			{#if fieldError('username')}<p class="field-error">{fieldError('username')}</p>{/if}
			<label for="activation-password">Kata sandi</label>
			<input id="activation-password" name="password" type="password" autocomplete="new-password" bind:value={password} required disabled={pending} />
			{#if fieldError('password')}<p class="field-error">{fieldError('password')}</p>{/if}
			<label for="display-name">Nama lengkap</label>
			<input id="display-name" name="display_name" type="text" autocomplete="name" bind:value={displayName} required disabled={pending} />
			{#if fieldError('display_name')}<p class="field-error">{fieldError('display_name')}</p>{/if}
			<button type="submit" disabled={pending}>{pending ? 'Mengaktifkan…' : 'Aktifkan akun'}</button>
		</form>
	{/if}
</section>

<style>
	.card { display: grid; gap: var(--space-4); width: min(100%, 30rem); padding: var(--space-6); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); box-shadow: var(--shadow-soft); }
	h1, p { margin: 0; } h1 { font-size: 1.4rem; } .description, small { color: var(--color-text-muted); } form { display: grid; gap: var(--space-2); } label { font-size: .85rem; font-weight: 700; } input { min-height: 2.7rem; padding: 0 var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-sm); } small { font-size: .75rem; } .error, .field-error { color: var(--color-danger); font-size: .85rem; font-weight: 600; } .success { color: var(--color-success); font-weight: 700; }
</style>
