<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { ApiError } from '$lib/api/client';
	import FieldError from '$lib/components/FieldError.svelte';
	import { createUser, type InviteUserInput } from './api';

	let { roleOptions, stationIds }: { roleOptions: string[]; stationIds: string[] } = $props();
	let form = $state({ email: '', displayName: '', role: '', stationId: '' });
	let pending = $state(false);
	let success = $state(false);
	let errorMessage = $state('');
	let fieldErrors = $state<Record<string, string>>({});
	$effect(() => {
		if (!form.role && roleOptions.length) form.role = roleOptions[0];
		if (!form.stationId && stationIds.length) form.stationId = stationIds[0];
	});

	function fieldError(field: string) { return fieldErrors[field] ?? fieldErrors[`body.${field}`]; }
	function errorText(cause: ApiError) {
		const code = cause.body.code.toLowerCase();
		const detail = cause.body.message.toLowerCase();
		if (cause.status === 422 && (code.includes('station') || detail.includes('stasiun'))) return 'Organisasi harus memiliki stasiun terlebih dahulu.';
		return cause.body.message || 'Undangan tidak dapat dikirim.';
	}

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		pending = true; success = false; errorMessage = ''; fieldErrors = {};
		const input: InviteUserInput = { email: form.email.trim(), display_name: form.displayName.trim(), role: form.role, station_id: form.stationId.trim() };
		try {
			await createUser(input);
			await invalidateAll();
			form.email = ''; form.displayName = ''; success = true;
		} catch (cause) {
			if (cause instanceof ApiError) {
				fieldErrors = cause.body.field_errors ?? {};
				errorMessage = Object.keys(fieldErrors).length ? '' : errorText(cause);
			} else errorMessage = 'Undangan tidak dapat dikirim.';
		} finally { pending = false; }
	}
</script>

<form class="panel form" onsubmit={submit} aria-labelledby="invite-user-title" aria-busy={pending}>
	<h2 id="invite-user-title">Undang pengguna</h2>
	<p class="hint">Layanan akan mengirim email aktivasi. Pengguna yang diundang menetapkan nama pengguna dan kata sandi sendiri.</p>
	{#if errorMessage}<p class="error" role="alert">{errorMessage}</p>{/if}
	{#if success}<p class="success" role="status">Undangan berhasil dikirim.</p>{/if}
	<div class="field-grid">
		<div><label for="user-email">Email<input id="user-email" type="email" bind:value={form.email} required disabled={pending} aria-invalid={Boolean(fieldError('email'))} /></label><FieldError message={fieldError('email')} /></div>
		<div><label for="user-display-name">Nama lengkap<input id="user-display-name" bind:value={form.displayName} required disabled={pending} aria-invalid={Boolean(fieldError('display_name'))} /></label><FieldError message={fieldError('display_name')} /></div>
		<div><label for="user-role">Peran<select id="user-role" bind:value={form.role} required disabled={pending}>{#each roleOptions as role}<option value={role}>{role}</option>{/each}</select></label><FieldError message={fieldError('role')} /></div>
		<div><label for="user-station">Stasiun<input id="user-station" bind:value={form.stationId} list="permitted-stations" required disabled={pending} aria-invalid={Boolean(fieldError('station_id'))} /></label><datalist id="permitted-stations">{#each stationIds as stationId}<option value={stationId}>{stationId}</option>{/each}</datalist><FieldError message={fieldError('station_id')} /></div>
	</div>
	<button type="submit" disabled={pending || !roleOptions.length}>{pending ? 'Mengirim…' : 'Kirim undangan'}</button>
</form>

<style>
	.form { display: grid; gap: var(--space-4); }
	h2, p { margin: 0; } h2 { font-size: 1.1rem; }
	.hint { color: var(--color-text-muted); font-size: .85rem; }
	.field-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-3); }
	.error { color: var(--color-danger); font-size: .85rem; font-weight: 600; } .success { color: var(--color-success); font-weight: 700; }
	@media (max-width: 40rem) { .field-grid { grid-template-columns: 1fr; } }
</style>
