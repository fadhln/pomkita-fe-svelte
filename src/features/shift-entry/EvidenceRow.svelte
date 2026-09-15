<script lang="ts">
	let { mode, hasEvidence, onUpload }: { mode: 'wajib' | 'opsional'; hasEvidence: boolean; onUpload?: (file: File) => void } = $props();
</script>

<label class="evidence-field">
	Bukti Loss dan gain
	<input aria-label="Bukti Loss dan gain" type="file" accept="image/*,application/pdf" required={mode === 'wajib' && !hasEvidence} onchange={(event) => {
		const file = (event.currentTarget as HTMLInputElement).files?.[0];
		if (file) onUpload?.(file);
	}} />
	<small>{hasEvidence ? 'Bukti sudah diunggah.' : mode === 'wajib' ? 'Bukti wajib diunggah untuk loss/gain ini.' : 'Bukti bersifat opsional.'}</small>
</label>
