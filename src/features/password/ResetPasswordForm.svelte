<script lang="ts">
	import { goto } from '$app/navigation';
	import { ApiError } from '$lib/api/client';
	import { resetPassword } from './api';

	let { token }: { token: string } = $props();
	let password = $state('');
	let confirmation = $state('');
	let pending = $state(false);
	let success = $state(false);
	let invalidToken = $state(false);
	let errorMessage = $state<string | undefined>();

	let hasToken = $derived(Boolean(token.trim()));

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (!hasToken || pending || invalidToken) return;
		if (password !== confirmation) {
			errorMessage = 'Kata sandi baru tidak sama.';
			return;
		}
		pending = true;
		errorMessage = undefined;
		try {
			await resetPassword({ token, password });
			success = true;
			await goto('/masuk');
		} catch (cause) {
			if (cause instanceof ApiError && cause.status === 400 && cause.body.code === 'invalid_token') {
				invalidToken = true;
				errorMessage = 'Tautan tidak valid atau sudah dipakai.';
			} else {
				errorMessage = cause instanceof ApiError ? cause.body.message : 'Kata sandi tidak dapat diatur ulang.';
			}
		} finally {
			pending = false;
		}
	}
</script>

<section class="card" aria-labelledby="reset-title">
	<h1 id="reset-title">Atur ulang kata sandi</h1>
	{#if !hasToken}
		<p class="error" role="alert">Tautan atur ulang tidak memiliki token.</p>
	{:else if success}
		<p class="success" role="status">Kata sandi berhasil diatur ulang. Silakan masuk.</p>
	{:else}
		{#if errorMessage}<p class="error" role="alert">{errorMessage}</p>{/if}
		<form onsubmit={submit} aria-busy={pending}>
			<label for="reset-password">Kata sandi baru<input id="reset-password" type="password" autocomplete="new-password" bind:value={password} required disabled={pending || invalidToken} /></label>
			<label for="reset-confirmation">Ulangi kata sandi baru<input id="reset-confirmation" type="password" autocomplete="new-password" bind:value={confirmation} required disabled={pending || invalidToken} /></label>
			<button type="submit" disabled={pending || invalidToken}>{pending ? 'Menyimpan…' : 'Atur ulang kata sandi'}</button>
		</form>
	{/if}
	<a href="/masuk">Kembali ke masuk</a>
</section>

<style>
	.card { display: grid; gap: var(--space-4); width: min(100%, 30rem); padding: var(--space-6); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); box-shadow: var(--shadow-soft); }
	h1, p { margin: 0; } h1 { font-size: 1.4rem; }
	form { display: grid; gap: var(--space-2); } label { display: grid; gap: var(--space-1); font-size: .8rem; font-weight: 700; } input { min-height: 2.7rem; padding: 0 var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-surface); color: var(--color-text); }
	button { min-height: 2.7rem; padding: 0 var(--space-3); border: 1px solid var(--color-primary); border-radius: var(--radius-sm); background: var(--color-primary); color: var(--color-surface); font-weight: 700; cursor: pointer; } button:disabled { cursor: wait; opacity: .6; }
	a { color: var(--color-primary); font-weight: 600; } .error { color: var(--color-danger); font-size: .85rem; font-weight: 600; } .success { color: var(--color-success); font-weight: 700; }
</style>
