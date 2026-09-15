<script lang="ts">
	import type { Session } from '$lib/session/api';
	import AmendmentCard from './AmendmentCard.svelte';
	import type { AmendmentQueueEntry } from './api';

	let { amendments, session }: { amendments: AmendmentQueueEntry[]; session: Session } = $props();
</script>

<section class="section" aria-labelledby="amendment-title">
	<header>
		<p class="eyebrow">Pemeriksaan</p>
		<h2 id="amendment-title">Antrean amendemen</h2>
		<p>Tinjau perubahan laporan yang menunggu persetujuan.</p>
	</header>
	{#if amendments.length === 0}
		<div class="empty" role="status"><strong>Tidak ada amendemen menunggu.</strong><span>Antrean akan terisi saat ada permintaan koreksi.</span></div>
	{:else}
		<div class="cards">{#each amendments as amendment (amendment.AmendmentID)}<AmendmentCard {amendment} {session} />{/each}</div>
	{/if}
</section>

<style>
	.section { display: grid; gap: var(--space-5); }
	header { display: grid; gap: var(--space-2); }
	h2, p { margin: 0; }
	h2 { font-size: 1.25rem; }
	header p:last-child { color: var(--color-text-muted); }
	.eyebrow { color: var(--color-primary); font-size: .72rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
	.cards { display: grid; gap: var(--space-5); }
	.empty { display: grid; gap: var(--space-2); justify-items: center; padding: var(--space-8); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); text-align: center; }
	.empty span { color: var(--color-text-muted); font-size: .85rem; }
</style>
