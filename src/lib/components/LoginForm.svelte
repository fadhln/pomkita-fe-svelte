<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { ApiError } from '$lib/api/client';
	import { login } from '$lib/session/api';

	let email = $state('');
	let password = $state('');
	let pending = $state(false);
	let hasError = $state(false);
	let errorCode = $state<string | undefined>();
	let invalidCredentials = $derived(errorCode === 'invalid_credentials');
	let errorMessage = $derived(invalidCredentials ? 'Email atau kata sandi salah' : hasError ? 'Tidak dapat terhubung ke layanan.' : undefined);

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		hasError = false;
		errorCode = undefined;
		pending = true;
		try {
			await login({ email, password });
			await invalidateAll();
			await goto('/');
		} catch (cause) {
			hasError = true;
			errorCode = cause instanceof ApiError ? cause.body.code : undefined;
		} finally {
			pending = false;
		}
	}
</script>

<div class="login-card">
	<h1 id="login-title">Masuk</h1>
	<p class="description">Masuk untuk melanjutkan ke PomKita.</p>
	<form onsubmit={submit} aria-busy={pending}>
		{#if errorMessage}<p class="error" role="alert">{errorMessage}</p>{/if}
		<label for="email">Email</label>
		<input id="email" name="email" type="email" autocomplete="email" bind:value={email} required disabled={pending} />
		<label for="password">Kata Sandi</label>
		<input id="password" name="password" type="password" autocomplete="current-password" bind:value={password} required disabled={pending} aria-invalid={invalidCredentials} />
		<button type="submit" disabled={pending} aria-busy={pending}>Masuk</button>
	</form>
</div>

<style>
	.login-card {
		padding: var(--space-6);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-soft);
	}

	h1 { margin: 0 0 var(--space-2); font-size: 1.4rem; }
	.description { margin: 0 0 var(--space-5); color: var(--color-text-muted); }
	form { display: grid; gap: var(--space-2); }
	label { font-size: 0.85rem; font-weight: 700; }
	input, button { min-height: 2.7rem; padding: 0 var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-sm); }
	input { margin-bottom: var(--space-2); background: var(--color-surface); }
	button { margin-top: var(--space-2); background: var(--color-primary); color: white; font-weight: 700; cursor: pointer; }
	button:disabled, input:disabled { cursor: wait; opacity: 0.65; }
	.error { margin: 0 0 var(--space-2); color: var(--color-danger); font-size: 0.85rem; font-weight: 600; }
</style>
