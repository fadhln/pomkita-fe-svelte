<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { ApiError } from '$lib/api/client';
	import FieldError from '$lib/components/FieldError.svelte';
	import TimezoneSelect from '$lib/components/TimezoneSelect.svelte';
	import { createOrganization, type OrganizationCreateInput } from './api';

	const blank = () => ({ name: '', legalName: '', address: '', contactEmail: '', timezone: 'Asia/Jakarta', firstStationName: '', firstStationTimezone: 'Asia/Jakarta' });
	let form = $state(blank());
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
		const input: OrganizationCreateInput = {
			name: form.name.trim(), legal_name: form.legalName.trim(), address: form.address.trim(), contact_email: form.contactEmail.trim(), timezone: form.timezone,
			first_station: { name: form.firstStationName.trim(), timezone: form.firstStationTimezone }
		};
		try {
			await createOrganization(input);
			await invalidateAll();
			form = blank();
			success = true;
		} catch (cause) {
			if (cause instanceof ApiError) {
				fieldErrors = cause.body.field_errors ?? {};
				errorMessage = cause.status === 409 ? (cause.body.message || 'Data organisasi bertabrakan dengan perubahan lain.') : cause.status === 422 ? cause.body.message : 'Organisasi tidak dapat dibuat.';
			} else errorMessage = 'Organisasi tidak dapat dibuat.';
		} finally { pending = false; }
	}
</script>

<form class="panel form" onsubmit={submit} aria-labelledby="create-organization-title" aria-busy={pending}>
	<h2 id="create-organization-title">Tambah organisasi</h2>
	<p class="hint">Stasiun pertama wajib diisi, karena peran Owner memerlukan stasiun.</p>
	{#if errorMessage}<p class="error" role="alert">{errorMessage}</p>{/if}
	{#if success}<p class="success" role="status">Organisasi berhasil dibuat.</p>{/if}
	<div class="field-grid">
		<div><label for="organization-name">Nama organisasi<input id="organization-name" bind:value={form.name} required disabled={pending} aria-invalid={Boolean(fieldError('name'))} /></label><FieldError message={fieldError('name')} /></div>
		<div><label for="organization-legal-name">Nama badan hukum<input id="organization-legal-name" bind:value={form.legalName} required disabled={pending} aria-invalid={Boolean(fieldError('legal_name'))} /></label><FieldError message={fieldError('legal_name')} /></div>
		<div><label for="organization-address">Alamat organisasi<textarea id="organization-address" bind:value={form.address} required disabled={pending} aria-invalid={Boolean(fieldError('address'))}></textarea></label><FieldError message={fieldError('address')} /></div>
		<div><label for="organization-contact-email">Email kontak organisasi<input id="organization-contact-email" type="email" bind:value={form.contactEmail} required disabled={pending} aria-invalid={Boolean(fieldError('contact_email'))} /></label><FieldError message={fieldError('contact_email')} /></div>
		<div><TimezoneSelect id="organization-timezone" label="Zona waktu organisasi" bind:value={form.timezone} disabled={pending} /><FieldError message={fieldError('timezone')} /></div>
	</div>
	<fieldset>
		<legend>Stasiun pertama</legend>
		<div class="field-grid">
			<div><label for="first-station-name">Nama stasiun pertama<input id="first-station-name" bind:value={form.firstStationName} required disabled={pending} aria-invalid={Boolean(fieldError('first_station.name'))} /></label><FieldError message={fieldError('first_station.name')} /></div>
			<div><TimezoneSelect id="first-station-timezone" label="Zona waktu stasiun pertama" bind:value={form.firstStationTimezone} disabled={pending} /><FieldError message={fieldError('first_station.timezone')} /></div>
		</div>
	</fieldset>
	<button type="submit" disabled={pending}>{pending ? 'Menyimpan…' : 'Tambah organisasi'}</button>
</form>

<style>
	.form { display: grid; gap: var(--space-4); }
	h2, p { margin: 0; } h2 { font-size: 1.1rem; }
	.hint { color: var(--color-text-muted); font-size: .85rem; }
	.field-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-3); }
	fieldset { display: grid; gap: var(--space-3); margin: 0; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-sm); } legend { padding: 0 var(--space-2); font-weight: 700; }
	.error { color: var(--color-danger); font-size: .85rem; font-weight: 600; } .success { color: var(--color-success); font-weight: 700; }
	@media (max-width: 40rem) { .field-grid { grid-template-columns: 1fr; } }
</style>
