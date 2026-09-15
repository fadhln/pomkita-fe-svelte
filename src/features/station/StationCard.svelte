<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { ApiError } from '$lib/api/client';
	import FieldError from '$lib/components/FieldError.svelte';
	import TimezoneSelect from '$lib/components/TimezoneSelect.svelte';
	import { disableStation, updateStation, type Station, type StationInput } from './api';

	let { station }: { station: Station } = $props();
	type Form = { name: string; code: string; address: string; timezone: string; enabled: boolean; id: string };
	let form = $state<Form>({ id: '', name: '', code: '', address: '', timezone: 'Asia/Jakarta', enabled: true });
	$effect(() => { if (!form || form.id !== station.id) form = { id: station.id, name: station.name, code: station.code ?? '', address: station.address, timezone: station.timezone, enabled: station.enabled }; });
	let pending = $state(false);
	let success = $state(false);
	let errorMessage = $state<string | undefined>();
	let fieldErrors = $state<Record<string, string>>({});
	function fieldError(field: string) { return fieldErrors[field] ?? fieldErrors[`body.${field}`]; }

	async function submit(event: SubmitEvent) {
		event.preventDefault(); pending = true; success = false; errorMessage = undefined; fieldErrors = {};
		const input: StationInput = { name: form.name.trim(), code: form.code.trim(), address: form.address.trim(), timezone: form.timezone, enabled: form.enabled };
		try { await updateStation(station.id, input); await invalidateAll(); success = true; }
		catch (cause) {
			if (cause instanceof ApiError) { fieldErrors = cause.body.field_errors ?? {}; errorMessage = cause.status === 409 ? (cause.body.message || 'Kode stasiun sudah digunakan.') : cause.status === 422 ? cause.body.message : 'Perubahan stasiun tidak dapat disimpan.'; }
			else errorMessage = 'Perubahan stasiun tidak dapat disimpan.';
		} finally { pending = false; }
	}

	async function disable() {
		if (!globalThis.confirm('Nonaktifkan stasiun ini? Stasiun dengan laporan atau baris peran dinonaktifkan, bukan dihapus.')) return;
		pending = true; errorMessage = undefined;
		try { await disableStation(station.id); form.enabled = false; await invalidateAll(); }
		catch { errorMessage = 'Stasiun tidak dapat dinonaktifkan.'; }
		finally { pending = false; }
	}
</script>

<article class="panel" aria-labelledby={`station-${station.id}`}>
	<header class="card-header"><div><h2 id={`station-${station.id}`}>{station.name}</h2><p>Kode: {station.code || '—'}</p></div><span class:disabled={!form.enabled} class="badge">{form.enabled ? 'Aktif' : 'Dinonaktifkan'}</span></header>
	<dl class="summary"><div><dt>Kode</dt><dd>{station.code || '—'}</dd></div><div><dt>Zona waktu</dt><dd>{station.timezone}</dd></div><div><dt>Status</dt><dd>{form.enabled ? 'Aktif' : 'Dinonaktifkan'}</dd></div></dl>
	<p class="hint">Stasiun dengan laporan atau baris peran dinonaktifkan, bukan dihapus.</p>
	{#if errorMessage}<p class="error" role="alert">{errorMessage}</p>{/if}{#if success}<p class="success" role="status">Perubahan stasiun disimpan.</p>{/if}
	<form onsubmit={submit} aria-busy={pending}>
		<div class="field-grid">
			<div><label for={`station-${station.id}-name`}>Nama stasiun<input id={`station-${station.id}-name`} bind:value={form.name} required disabled={pending} /></label><FieldError message={fieldError('name')} /></div>
			<div><label for={`station-${station.id}-code`}>Kode stasiun<input id={`station-${station.id}-code`} bind:value={form.code} disabled={pending} aria-invalid={Boolean(fieldError('code'))} /></label><FieldError message={fieldError('code')} /></div>
			<div><label for={`station-${station.id}-address`}>Alamat stasiun<textarea id={`station-${station.id}-address`} bind:value={form.address} required disabled={pending}></textarea></label><FieldError message={fieldError('address')} /></div>
			<div><TimezoneSelect id={`station-${station.id}-timezone`} label="Zona waktu stasiun" bind:value={form.timezone} disabled={pending} /><FieldError message={fieldError('timezone')} /></div>
		</div>
		<button type="submit" disabled={pending}>{pending ? 'Menyimpan…' : 'Simpan stasiun'}</button>
	</form>
	{#if form.enabled}<button class="danger" type="button" disabled={pending} onclick={() => void disable()}>Nonaktifkan stasiun</button>{/if}
</article>

<style>
	.panel { display: grid; gap: var(--space-4); } h2, p, dl { margin: 0; } h2 { font-size: 1.1rem; } .card-header { display: flex; justify-content: space-between; gap: var(--space-3); align-items: start; } .card-header p, .hint, dt { color: var(--color-text-muted); font-size: .85rem; }
	.badge.disabled { background: var(--color-border); color: var(--color-text-muted); } .summary { display: flex; flex-wrap: wrap; gap: var(--space-6); } .summary div { display: grid; gap: var(--space-1); } dt { font-size: .75rem; } dd { margin: 0; font-weight: 700; }
	.field-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-3); } .error { color: var(--color-danger); font-size: .85rem; font-weight: 600; } .success { color: var(--color-success); font-weight: 700; } .danger { border-color: var(--color-danger); background: var(--color-danger); }
	@media (max-width: 40rem) { .field-grid { grid-template-columns: 1fr; } }
</style>
