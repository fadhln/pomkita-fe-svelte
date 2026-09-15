<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { ApiError } from '$lib/api/client';
	import FieldError from '$lib/components/FieldError.svelte';
	import TimezoneSelect from '$lib/components/TimezoneSelect.svelte';
	import { disableOrganization, updateOrganization, type Organization, type OrganizationInput } from './api';

	let { organization, isSuperadmin }: { organization: Organization; isSuperadmin: boolean } = $props();
	type Form = { name: string; legalName: string; address: string; contactEmail: string; timezone: string; enabled: boolean; id: string };
	let form = $state<Form>({ id: '', name: '', legalName: '', address: '', contactEmail: '', timezone: 'Asia/Jakarta', enabled: true });
	$effect(() => { if (!form || form.id !== organization.id) form = { id: organization.id, name: organization.name, legalName: organization.legal_name, address: organization.address, contactEmail: organization.contact_email, timezone: organization.timezone, enabled: organization.enabled }; });
	let pending = $state(false);
	let errorMessage = $state<string | undefined>();
	let success = $state(false);
	let fieldErrors = $state<Record<string, string>>({});

	function fieldError(field: string) { return fieldErrors[field] ?? fieldErrors[`body.${field}`]; }

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		pending = true; success = false; errorMessage = undefined; fieldErrors = {};
		const input: OrganizationInput = { name: form.name.trim(), legal_name: form.legalName.trim(), address: form.address.trim(), contact_email: form.contactEmail.trim(), timezone: form.timezone };
		if (isSuperadmin) input.enabled = form.enabled;
		try {
			await updateOrganization(organization.id, input);
			await invalidateAll();
			success = true;
		} catch (cause) {
			if (cause instanceof ApiError) {
				fieldErrors = cause.body.field_errors ?? {};
				errorMessage = cause.status === 409 ? (cause.body.message || 'Perubahan organisasi bertabrakan dengan perubahan lain.') : cause.status === 422 ? cause.body.message : 'Perubahan organisasi tidak dapat disimpan.';
			} else errorMessage = 'Perubahan organisasi tidak dapat disimpan.';
		} finally { pending = false; }
	}

	async function disable() {
		if (!globalThis.confirm('Nonaktifkan organisasi ini? Organisasi tidak dapat dihapus.')) return;
		pending = true; errorMessage = undefined;
		try { await disableOrganization(organization.id); form.enabled = false; await invalidateAll(); }
		catch { errorMessage = 'Organisasi tidak dapat dinonaktifkan.'; }
		finally { pending = false; }
	}
</script>

<article class="panel" aria-labelledby={`organization-${organization.id}`}>
	<header class="card-header"><div><h2 id={`organization-${organization.id}`}>{organization.name}</h2><p>{organization.legal_name}</p></div><span class:disabled={!form.enabled} class="badge">{form.enabled ? 'Aktif' : 'Dinonaktifkan'}</span></header>
	{#if errorMessage}<p class="error" role="alert">{errorMessage}</p>{/if}
	{#if success}<p class="success" role="status">Perubahan organisasi disimpan.</p>{/if}
	<form onsubmit={submit} aria-busy={pending}>
		<div class="field-grid">
			<div><label for={`organization-${organization.id}-name`}>Nama organisasi<input id={`organization-${organization.id}-name`} bind:value={form.name} required disabled={pending} aria-invalid={Boolean(fieldError('name'))} /></label><FieldError message={fieldError('name')} /></div>
			<div><label for={`organization-${organization.id}-legal-name`}>Nama badan hukum<input id={`organization-${organization.id}-legal-name`} bind:value={form.legalName} required disabled={pending} aria-invalid={Boolean(fieldError('legal_name'))} /></label><FieldError message={fieldError('legal_name')} /></div>
			<div><label for={`organization-${organization.id}-address`}>Alamat organisasi<textarea id={`organization-${organization.id}-address`} bind:value={form.address} required disabled={pending} aria-invalid={Boolean(fieldError('address'))}></textarea></label><FieldError message={fieldError('address')} /></div>
			<div><label for={`organization-${organization.id}-contact-email`}>Email kontak organisasi<input id={`organization-${organization.id}-contact-email`} type="email" bind:value={form.contactEmail} required disabled={pending} aria-invalid={Boolean(fieldError('contact_email'))} /></label><FieldError message={fieldError('contact_email')} /></div>
			<div><TimezoneSelect id={`organization-${organization.id}-timezone`} label="Zona waktu organisasi" bind:value={form.timezone} disabled={pending} /><FieldError message={fieldError('timezone')} /></div>
			{#if isSuperadmin}<label class="checkbox" for={`organization-${organization.id}-enabled`}>Status aktif<input id={`organization-${organization.id}-enabled`} type="checkbox" bind:checked={form.enabled} disabled={pending} /></label>{/if}
		</div>
		<button type="submit" disabled={pending}>{pending ? 'Menyimpan…' : 'Simpan organisasi'}</button>
	</form>
	{#if isSuperadmin && form.enabled}<button class="danger" type="button" disabled={pending} onclick={() => void disable()}>Nonaktifkan organisasi</button>{/if}
</article>

<style>
	.panel { display: grid; gap: var(--space-4); } h2, p { margin: 0; } h2 { font-size: 1.1rem; } .card-header { display: flex; justify-content: space-between; gap: var(--space-3); align-items: start; } .card-header p { color: var(--color-text-muted); font-size: .85rem; }
	.badge.disabled { background: var(--color-border); color: var(--color-text-muted); }
	.field-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-3); } .checkbox { align-items: center; grid-template-columns: auto 1.2rem; justify-content: start; gap: var(--space-2); } .checkbox input { width: 1.1rem; min-height: 1.1rem; }
	.error { color: var(--color-danger); font-size: .85rem; font-weight: 600; } .success { color: var(--color-success); font-weight: 700; } .danger { border-color: var(--color-danger); background: var(--color-danger); }
	@media (max-width: 40rem) { .field-grid { grid-template-columns: 1fr; } }
</style>
