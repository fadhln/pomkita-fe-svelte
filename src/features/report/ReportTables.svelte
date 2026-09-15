<script lang="ts">
	import type { ReportView } from './api';
	let { report }: { report: ReportView } = $props();
	const readings = $derived(report.readings ?? []);
	const sales = $derived(report.sales ?? []);
	const losses = $derived(report.losses ?? []);
</script>

<section class="panel" aria-labelledby="reading-title">
	<h2 id="reading-title">Pembacaan meter</h2>
	{#if readings.length}<div class="table-wrap"><table><thead><tr><th>Nozel</th><th>Meter awal</th><th>Meter akhir</th><th>Penjualan yang diharapkan</th></tr></thead><tbody>{#each readings as row (row.nozzle_id)}<tr><td>{row.nozzle_id}</td><td>{row.meter_start}</td><td>{row.meter_end}</td><td>{row.expected_sale}</td></tr>{/each}</tbody></table></div>{:else}<p class="empty">Tidak ada pembacaan meter.</p>{/if}
</section>
<section class="panel" aria-labelledby="sales-title">
	<h2 id="sales-title">Penjualan</h2>
	{#if sales.length}<div class="table-wrap"><table><thead><tr><th>Dispenser</th><th>Tunai</th><th>Nontunai</th></tr></thead><tbody>{#each sales as row (row.dispenser_id)}<tr><td>{row.dispenser_id}</td><td>{row.cash_amount}</td><td>{row.cashless_amount}</td></tr>{/each}</tbody></table></div>{:else}<p class="empty">Tidak ada penjualan.</p>{/if}
</section>
<section class="panel" aria-labelledby="loss-title">
	<h2 id="loss-title">Loss dan gain</h2>
	{#if losses.length}<div class="table-wrap"><table><thead><tr><th>Loss</th><th>Arah</th><th>Liter</th><th>Rupiah</th><th>Catatan</th></tr></thead><tbody>{#each losses as row (row.row_id)}<tr><td>{row.loss_id}</td><td>{row.direction}</td><td>{row.liters}</td><td>{row.cash_amount ?? '—'}</td><td>{row.note ?? '—'}</td></tr>{/each}</tbody></table></div>{:else}<p class="empty">Tidak ada loss atau gain.</p>{/if}
</section>

<style>
	.panel { display: grid; gap: var(--space-3); padding: var(--space-5); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
	h2 { margin: 0; font-size: 1.05rem; } .table-wrap { overflow-x: auto; } table { width: 100%; border-collapse: collapse; font-variant-numeric: tabular-nums; } th, td { padding: .65rem; border-bottom: 1px solid var(--color-border); text-align: left; white-space: nowrap; } th { color: var(--color-text-muted); font-size: .75rem; } .empty { margin: 0; color: var(--color-text-muted); }
</style>
