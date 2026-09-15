<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { ApiError } from '$lib/api/client';
	import { changePassword } from './api';

	let currentPassword = $state('');
	let newPassword = $state('');
	let pending = $state(false);
	let success = $state(false);
	let errorMessage = $state<string | undefined>();
	let currentPasswordError = $state<string | undefined>();
	let fieldErrors = $state<Record<string, string>>({});

	function fieldError(field: string) {
		return fieldErrors[field] ?? fieldErrors[`body.${field}`];
	}

	function isCurrentPasswordError(cause: ApiError) {
		const code = cause.body.code;
		return cause.status === 403 || code.includes('current_password') || code.includes('wrong_password') || Boolean(fieldError('current_password'));
	}

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		pending = true;
		success = false;
		errorMessage = undefined;
		currentPasswordError = undefined;
		fieldErrors = {};
		try {
			await changePassword({ current_password: currentPassword, new_password: newPassword });
			await invalidateAll();
			success = true;
			currentPassword = '';
			newPassword = '';
		} catch (cause) {
			if (cause instanceof ApiError) {
				fieldErrors = cause.body.field_errors ?? {};
				if (isCurrentPasswordError(cause)) currentPasswordError = fieldError('current_password') ?? 'Kata sandi saat ini salah.';
				else errorMessage = cause.body.message;
			} else {
				errorMessage = 'Kata sandi tidak dapat diubah.';
			}
		} finally {
			pending = false;
		}
	}
</script>

<article class="card" aria-labelledby="password-title">
	<h2 id="password-title">Kata sandi</h2>
	<p class="description">Gunakan kata sandi baru yang kuat dan hanya Anda ketahui.</p>
	{#if success}<p class="success" role="status">Kata sandi berhasil diubah.</p>{/if}
	{#if errorMessage}<p class="error" role="alert">{errorMessage}</p>{/if}
	<form onsubmit={submit} aria-busy={pending}>
		<label for="current-password">Kata sandi saat ini<input id="current-password" type="password" autocomplete="current-password" bind:value={currentPassword} required disabled={pending} aria-invalid={Boolean(currentPasswordError)} aria-describedby={currentPasswordError ? 'current-password-error' : undefined} /></label>
		{#if currentPasswordError}<p id="current-password-error" class="field-error">{currentPasswordError}</p>{/if}
		<label for="new-password">Kata sandi baru<input id="new-password" type="password" autocomplete="new-password" bind:value={newPassword} required disabled={pending} /></label>
		{#if fieldError('new_password')}<p class="field-error">{fieldError('new_password')}</p>{/if}
		<button type="submit" disabled={pending}>{pending ? 'Mengubah…' : 'Ubah kata sandi'}</button>
	</form>
</article>

<style>
	.card { display: grid; gap: var(--space-4); padding: var(--space-5); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); box-shadow: var(--shadow-soft); }
	h2, p { margin: 0; } h2 { font-size: 1.1rem; } .description { color: var(--color-text-muted); font-size: .85rem; }
	form { display: grid; gap: var(--space-2); } label { display: grid; gap: var(--space-1); font-size: .8rem; font-weight: 700; } input { width: 100%; min-height: 2.6rem; padding: .45rem .65rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-surface); color: var(--color-text); }
	button { min-height: 2.6rem; padding: .45rem .8rem; border: 1px solid var(--color-primary); border-radius: var(--radius-sm); background: var(--color-primary); color: var(--color-surface); font-weight: 700; cursor: pointer; } button:disabled { cursor: wait; opacity: .6; }
	.error, .field-error { color: var(--color-danger); font-size: .85rem; font-weight: 600; } .success { color: var(--color-success); font-weight: 700; }
</style>
