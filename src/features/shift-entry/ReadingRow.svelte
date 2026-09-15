<script lang="ts">
	import { getRolloverDelta } from './format';
import type { DraftReading } from './api';

	type Nozzle = { nozzle_id: string; label?: string; meter_max: string };
	let { nozzle, reading, onSave }: { nozzle: Nozzle; reading?: DraftReading; onSave?: (value: { meter_start: string; meter_end: string }) => void } = $props();
	function initialValues() { return { start: reading?.meter_start ?? '', end: reading?.meter_end ?? '' }; }
	const initial = initialValues();
	let start = $state(initial.start);
	let end = $state(initial.end);
	let label = $derived(nozzle.label || nozzle.nozzle_id);
	let delta = $derived(start && end ? getRolloverDelta(start, end, nozzle.meter_max) : null);

	function save() {
		if (start && end) onSave?.({ meter_start: start, meter_end: end });
	}
</script>

<article class="row-card">
	<header class="row-title"><strong>{label}</strong>{#if delta}<span>Delta: {delta.delta}</span>{/if}</header>
	<div class="field-grid">
		<label>Meter awal Nozzle {label}<input aria-label="Meter awal Nozzle {label}" inputmode="decimal" bind:value={start} onblur={save} /></label>
		<label>Meter akhir Nozzle {label}<input aria-label="Meter akhir Nozzle {label}" inputmode="decimal" bind:value={end} onblur={save} /></label>
	</div>
	{#if delta?.rollover}<p class="warning" role="status">Meter melewati batas dan kembali ke awal.</p>{/if}
</article>
