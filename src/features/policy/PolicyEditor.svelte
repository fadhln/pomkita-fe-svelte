<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { createPolicyRevision, requestFromRevision, type PolicyRevision, type PolicyRevisionRequest } from './api';

	let { revisions, stationId }: { revisions: PolicyRevision[]; stationId: string } = $props();
	let kind = $state('threshold');
	let validFrom = $state('');
	let draft = $state({ loss_liter_threshold: '10.00', gain_liter_threshold: '10.00', loss_rupiah_threshold: '0', gain_rupiah_threshold: '0', variance_rupiah_threshold: '0', rollover_threshold: '0.0', evidence_mode: 'opsional' });
	let pending = $state(false); let error = $state(''); let selected = $state<PolicyRevision>(); let reason = $state(''); let tombstonePending = $state(false);
	const current = $derived(revisions.find((row) => !row.disabled));
	const update = (key: keyof typeof draft, value: string) => (draft[key] = value);
	function reset() { kind = current?.policy_kind ?? 'threshold'; validFrom = ''; error = ''; }
	async function save() {
		if (!validFrom || !stationId) return; pending = true; error = '';
		const base = revisions.find((row) => !row.disabled && row.policy_kind === kind);
		const input: PolicyRevisionRequest = { policy_kind: kind, policy_id: base?.policy_id ?? globalThis.crypto.randomUUID(), station_id: stationId, valid_from: new Date(validFrom).toISOString(), supersedes_revision_id: base?.revision_id ?? '', disabled: false, tombstone_reason: '', ...draft };
		try { await createPolicyRevision(input); reset(); await invalidateAll(); } catch { error = 'Revisi kebijakan tidak dapat disimpan.'; } finally { pending = false; }
	}
	async function tombstone() {
		if (!selected || !reason.trim()) return; tombstonePending = true; error = '';
		try { await createPolicyRevision(requestFromRevision(selected, stationId, { valid_from: new Date().toISOString(), disabled: true, tombstone_reason: reason.trim() })); selected = undefined; reason = ''; await invalidateAll(); } catch { error = 'Revisi kebijakan tidak dapat dinonaktifkan.'; } finally { tombstonePending = false; }
	}
</script>

<section class="editor" aria-labelledby="policy-editor-title">
	<div class="notice">Kebijakan disimpan sebagai revisi berurutan. Nilai desimal dikirim sebagai teks.</div>
	<section class="panel"><div class="toolbar"><h2 id="policy-editor-title">Revisi kebijakan</h2><button type="button" class="secondary" onclick={reset}>Revisi baru</button></div>
		<form onsubmit={(event) => { event.preventDefault(); void save(); }}><div class="field-grid"><label>Jenis kebijakan<select bind:value={kind}><option value="threshold">Ambang</option><option value="evidence">Bukti</option></select></label><label>Berlaku mulai<input type="datetime-local" bind:value={validFrom} required /></label></div>
			{#if kind === 'threshold'}<div class="field-grid">{#each Object.keys(draft).filter((key) => key !== 'evidence_mode') as key}<label>{key}<input inputmode="decimal" value={draft[key as keyof typeof draft]} oninput={(event) => update(key as keyof typeof draft, event.currentTarget.value)} /></label>{/each}</div>{:else}<label>Mode bukti<select bind:value={draft.evidence_mode}><option value="opsional">Opsional</option><option value="wajib">Wajib</option></select></label>{/if}
			<button disabled={pending || !validFrom} type="submit">{pending ? 'Menyimpan…' : 'Simpan revisi'}</button>
		</form>
		{#if error}<p class="error" role="alert">{error}</p>{/if}
	</section>
	<section class="panel"><h2>Riwayat</h2>{#if current}<p class="current">Berlaku sekarang: {current.policy_kind} · {current.valid_from}</p>{/if}{#if revisions.length}<div class="table-wrap"><table><thead><tr><th>Revisi</th><th>Jenis</th><th>Berlaku mulai</th><th>Status</th><th></th></tr></thead><tbody>{#each revisions as revision (revision.revision_id)}<tr><td>{revision.revision_id}</td><td>{revision.policy_kind}</td><td>{revision.valid_from}</td><td>{revision.disabled ? 'Dinonaktifkan' : 'Aktif'}</td><td>{#if !revision.disabled}<button class="danger" type="button" onclick={() => (selected = revision)}>Nonaktifkan</button>{/if}</td></tr>{/each}</tbody></table></div>{:else}<p class="empty">Belum ada riwayat kebijakan.</p>{/if}</section>
</section>

{#if selected}<div class="backdrop" role="presentation"><dialog open class="dialog" aria-labelledby="tombstone-title"><h2 id="tombstone-title">Nonaktifkan revisi</h2><p>Tindakan ini membuat revisi tombstone baru.</p><label>Alasan penonaktifan<textarea bind:value={reason}></textarea></label><div class="actions"><button class="secondary" type="button" onclick={() => (selected = undefined)}>Batal</button><button class="danger" type="button" disabled={tombstonePending || !reason.trim()} onclick={() => void tombstone()}>Konfirmasi nonaktifkan</button></div></dialog></div>{/if}

<style>
	.editor { display: grid; gap: var(--space-5); } .notice { padding: var(--space-3); background: #fff8e8; color: var(--color-warning); border-radius: var(--radius-sm); } .panel { display: grid; gap: var(--space-4); padding: var(--space-5); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); } h2 { margin: 0; font-size: 1.05rem; } .toolbar, .actions { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); } form { display: grid; gap: var(--space-4); } .field-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr)); gap: var(--space-3); } label { display: grid; gap: .35rem; font-size: .8rem; font-weight: 700; } input, select, textarea { width: 100%; min-height: 2.5rem; padding: .45rem .65rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-surface); } textarea { min-height: 5rem; } button { width: fit-content; } .secondary { border-color: var(--color-border); background: var(--color-surface); color: var(--color-primary); } .danger { border-color: var(--color-danger); background: var(--color-danger); } .error { color: var(--color-danger); } .current, .empty { margin: 0; color: var(--color-text-muted); } .table-wrap { overflow-x: auto; } table { width: 100%; border-collapse: collapse; font-variant-numeric: tabular-nums; } th, td { padding: .6rem; border-bottom: 1px solid var(--color-border); text-align: left; white-space: nowrap; } th { color: var(--color-text-muted); font-size: .75rem; } .backdrop { position: fixed; inset: 0; z-index: 2; display: grid; place-items: center; padding: var(--space-4); background: rgb(21 34 56 / .35); } .dialog { width: min(100%, 28rem); display: grid; gap: var(--space-4); padding: var(--space-6); background: var(--color-surface); border-radius: var(--radius-md); box-shadow: var(--shadow-soft); } .dialog h2, .dialog p { margin: 0; }
</style>
