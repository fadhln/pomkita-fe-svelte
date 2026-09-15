<script lang="ts">
	import EvidenceRow from './EvidenceRow.svelte';
	import { formatRupiahInput, unformatRupiahInput } from './format';
	import type { DraftEvidence, DraftLoss } from './api';

	type LossValue = { direction: 'loss' | 'gain'; reason_code: string; liters: string; cash_amount: string; note: string };
	let { loss, reasonCodes = [], evidenceMode, evidence = [], error, onSave, onUpload }: { loss: DraftLoss; reasonCodes?: string[]; evidenceMode?: 'wajib' | 'opsional'; evidence?: DraftEvidence[]; error?: string; onSave?: (value: LossValue) => void; onUpload?: (file: File) => void } = $props();
	function initialValues() { return { direction: loss.direction, reason: loss.reason_code || (evidenceMode === 'opsional' ? 'loss_exception' : ''), liters: loss.liters, cash: formatRupiahInput(loss.cash_amount ?? ''), note: loss.note ?? '' }; }
	const initial = initialValues();
	let direction = $state(initial.direction);
	let reason = $state(initial.reason);
	let liters = $state(initial.liters);
	let cash = $state(initial.cash);
	let note = $state(initial.note);
	let hasEvidence = $derived(evidence.some((item) => item.loss_row_id === loss.row_id));
	let options = $derived([...reasonCodes, ...(evidenceMode === 'opsional' && !hasEvidence ? ['loss_exception'] : [])]);

	function save() {
		onSave?.({ direction, reason_code: reason, liters, cash_amount: cash ? unformatRupiahInput(cash) : '', note });
	}
</script>

<article class="row-card">
	<header class="row-title"><strong>{loss.loss_id}</strong></header>
	{#if error}<p class="error" role="alert">{error}</p>{/if}
	<div class="field-grid">
		<label>Arah Loss dan gain<select aria-label="Arah Loss dan gain" bind:value={direction} onchange={save}><option value="loss">Loss</option><option value="gain">Gain</option></select></label>
		<label>Alasan Loss dan gain<select aria-label="Alasan Loss dan gain" bind:value={reason} onchange={save}><option value="">Alasan</option>{#each options as option}<option value={option}>{option}</option>{/each}</select></label>
		<label>Liter Loss dan gain<input aria-label="Liter Loss dan gain" inputmode="decimal" bind:value={liters} onblur={save} /></label>
		<label>Nilai Rupiah Loss dan gain<input aria-label="Nilai Rupiah Loss dan gain" inputmode="numeric" bind:value={cash} oninput={() => (cash = formatRupiahInput(cash))} onblur={save} /></label>
	</div>
	<label>Catatan Loss dan gain<textarea aria-label="Catatan Loss dan gain" bind:value={note} onblur={save}></textarea></label>
	{#if evidenceMode}<EvidenceRow mode={evidenceMode} {hasEvidence} {onUpload} />{/if}
</article>
