<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { ApiError } from '$lib/api/client';
	import FieldError from '$lib/components/FieldError.svelte';
	import TimezoneSelect from '$lib/components/TimezoneSelect.svelte';
	import { createStation } from './api';

	const blank = () => ({ name: '', code: '', address: '', timezone: 'Asia/Jakarta' });
	let form = $state(blank());
	let pending = $state(false);
	let success = $state(false);
	let errorMessage = $state<string | undefined>();
	let fieldErrors = $state<Record<string, string>>({});

	async function submit(event: SubmitEvent) {
		event.preventDefault(); pending = true; success = false; errorMessage = undefined; fieldErrors = {};
		try {
			await createStation({ name: form.name.trim(), code: form.code.trim(), address: form.address.trim(), timezone: form.timezone });
			await invalidateAll(); form = blank(); success = true;
		} catch (cause) {
			if (cause instanceof ApiError) {
				fieldErrors = cause.body.field_errors ?? {};
				errorMessage = cause.status === 409 ? (cause.body.message || 'Kode stasiun sudah digunakan.') : cause.status === 422 ? cause.body.message : 'Stasiun tidak dapat dibuat.';
			} else errorMessage = 'Stasiun tidak dapat dibuat.';
		} finally { pending = false; }
	}
</script>

<form class="panel form" onsubmit={submit} aria-labelledby="create-station-title" aria-busy={pending}>
	<h2 id="create-station-title">Tambah stasiun</h2>
	{#if errorMessage}<p class="error" role="alert">{errorMessage}</p>{/if}
	{#if success}<p class="success" role="status">Stasiun berhasil dibuat.</p>{/if}
	<div class="field-grid">
		<div><label for="new-station-name">Nama stasiun baru<input id="new-station-name" bind:value={form.name} required disabled={pending} aria-invalid={Boolean(fieldErrors.name || fieldErrors['body.name'])} /></label><FieldError message={fieldErrors.name ?? fieldErrors['body.name']} /></div>
		<div><label for="new-station-code">Kode stasiun baru<input id="new-station-code" bind:value={form.code} disabled={pending} aria-invalid={Boolean(fieldErrors.code || fieldErrors['body.code'])} /></label><FieldError message={fieldErrors.code ?? fieldErrors['body.code']} /></div>
		<div><label for="new-station-address">Alamat stasiun baru<textarea id="new-station-address" bind:value={form.address} required disabled={pending} aria-invalid={Boolean(fieldErrors.address || fieldErrors['body.address'])}></textarea></label><FieldError message={fieldErrors.address ?? fieldErrors['body.address']} /></div>
		<div><TimezoneSelect id="new-station-timezone" label="Zona waktu stasiun baru" bind:value={form.timezone} disabled={pending} /><FieldError message={fieldErrors.timezone ?? fieldErrors['body.timezone']} /></div>
	</div>
	<button type="submit" disabled={pending}>{pending ? 'Menyimpan…' : 'Tambah stasiun'}</button>
</form>

<style>
	.form { display: grid; gap: var(--space-4); } h2, p { margin: 0; } h2 { font-size: 1.1rem; } .field-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-3); }
	.error { color: var(--color-danger); font-size: .85rem; font-weight: 600; } .success { color: var(--color-success); font-weight: 700; }
	@media (max-width: 40rem) { .field-grid { grid-template-columns: 1fr; } }
</style>
