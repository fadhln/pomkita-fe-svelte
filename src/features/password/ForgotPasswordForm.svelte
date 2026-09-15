<script lang="ts">
	import { ApiError } from '$lib/api/client';
	import { forgotPassword } from './api';

	let identifier = $state('');
	let pending = $state(false);
	let success = $state(false);
	let errorMessage = $state<string | undefined>();

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		pending = true;
		errorMessage = undefined;
		try {
			await forgotPassword({ identifier: identifier.trim() });
			success = true;
		} catch (cause) {
			errorMessage = cause instanceof ApiError ? cause.body.message : 'Permintaan tidak dapat diproses.';
		} finally {
			pending = false;
		}
	}
</script>

<section class="card" aria-labelledby="forgot-title">
	<h1 id="forgot-title">Lupa sandi?</h1>
	<p class="description">Masukkan nama pengguna atau alamat email untuk menerima tautan atur ulang.</p>
	{#if success}<p class="success" role="status">Jika akun itu ada, kami sudah mengirim tautan atur ulang.</p>{/if}
	{#if errorMessage}<p class="error" role="alert">{errorMessage}</p>{/if}
	<form onsubmit={submit} aria-busy={pending}>
		<label for="identifier">Nama pengguna atau alamat email<input id="identifier" name="identifier" type="text" autocomplete="username" bind:value={identifier} required disabled={pending} /></label>
		<button type="submit" disabled={pending}>{pending ? 'Mengirim…' : 'Kirim tautan atur ulang'}</button>
	</form>
	<a href="/masuk">Kembali ke masuk</a>
</section>

<style>
	.card { display: grid; gap: var(--space-4); width: min(100%, 30rem); padding: var(--space-6); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); box-shadow: var(--shadow-soft); }
	h1, p { margin: 0; } h1 { font-size: 1.4rem; } .description { color: var(--color-text-muted); }
	form { display: grid; gap: var(--space-2); } label { display: grid; gap: var(--space-1); font-size: .8rem; font-weight: 700; } input { min-height: 2.7rem; padding: 0 var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-surface); color: var(--color-text); }
	button { min-height: 2.7rem; padding: 0 var(--space-3); border: 1px solid var(--color-primary); border-radius: var(--radius-sm); background: var(--color-primary); color: var(--color-surface); font-weight: 700; cursor: pointer; } button:disabled { cursor: wait; opacity: .6; }
	a { color: var(--color-primary); font-weight: 600; } .error { color: var(--color-danger); font-size: .85rem; font-weight: 600; } .success { color: var(--color-success); font-weight: 700; }
</style>
