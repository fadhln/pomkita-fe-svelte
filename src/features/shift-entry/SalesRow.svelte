<script lang="ts">
	import { formatRupiahInput, unformatRupiahInput } from './format';
import type { DraftSale } from './api';

	type Dispenser = { dispenser_id: string; label?: string };
	let { dispenser, sale, onSave }: { dispenser: Dispenser; sale?: DraftSale; onSave?: (value: { cash_amount: string; cashless_amount: string }) => void } = $props();
	function initialValues() { return { cash: formatRupiahInput(sale?.cash_amount ?? '0'), cashless: formatRupiahInput(sale?.cashless_amount ?? '0') }; }
	const initial = initialValues();
	let cash = $state(initial.cash);
	let cashless = $state(initial.cashless);
	let label = $derived(dispenser.label || dispenser.dispenser_id);

	function save() {
		onSave?.({ cash_amount: unformatRupiahInput(cash), cashless_amount: unformatRupiahInput(cashless) });
	}
</script>

<article class="row-card">
	<header class="row-title"><strong>{label}</strong></header>
	<div class="field-grid">
		<label>Tunai Dispenser {label}<input aria-label="Tunai Dispenser {label}" inputmode="numeric" bind:value={cash} oninput={() => (cash = formatRupiahInput(cash))} onblur={save} /></label>
		<label>Non-tunai Dispenser {label}<input aria-label="Non-tunai Dispenser {label}" inputmode="numeric" bind:value={cashless} oninput={() => (cashless = formatRupiahInput(cashless))} onblur={save} /></label>
	</div>
</article>
