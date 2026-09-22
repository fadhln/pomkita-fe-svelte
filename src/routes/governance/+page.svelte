<script lang="ts">
	import type { Session } from '$lib/session/api';
	import AckQueue from '../../features/governance/AckQueue.svelte';
	import AmendmentQueue from '../../features/governance/AmendmentQueue.svelte';

	let { data }: { data: { amendments: import('../../features/governance/api').AmendmentQueueEntry[]; shifts: Array<import('../../features/shift-entry/api').ShiftListItem & { current_report_id: string }>; session: Session } } = $props();
</script>

<svelte:head><title>Tata kelola | PomKita</title></svelte:head>
<section class="page" aria-labelledby="governance-title">
	<header class="page-header"><p class="overline">Kontrol dan persetujuan</p><h1 id="governance-title">Tata kelola</h1><p>Kelola konfirmasi laporan dan amendemen secara terpisah.</p></header>
	<AckQueue shifts={data.shifts} session={data.session} />
	<AmendmentQueue amendments={data.amendments} session={data.session} />
</section>

<style>
	.page { display: grid; gap: var(--space-8); }
	.page-header { display: grid; gap: var(--space-2); }
	.page-header h1, .page-header p { margin: 0; }
	.page-header p:last-child { color: var(--color-text-muted); }
	h1 { font-size: 2rem; }
</style>
