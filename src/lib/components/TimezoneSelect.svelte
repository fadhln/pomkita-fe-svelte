<script lang="ts">
	const timezones = ['Asia/Jakarta', 'Asia/Makassar', 'Asia/Jayapura'];
	let { id, label, value = $bindable('Asia/Jakarta'), disabled = false }: { id: string; label: string; value?: string; disabled?: boolean } = $props();
</script>

<label for={id}>{label}
	<select {id} bind:value disabled={disabled} required>
		{#each timezones as timezone}<option value={timezone}>{timezone}</option>{/each}
	</select>
</label>
