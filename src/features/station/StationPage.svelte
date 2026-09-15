<script lang="ts">
	import StationCard from './StationCard.svelte';
	import StationCreateForm from './StationCreateForm.svelte';
	import type { Station } from './api';

	let { stations, isOwner, isSuperadmin, authorized = true }: { stations: Station[]; isOwner: boolean; isSuperadmin: boolean; authorized?: boolean } = $props();
</script>

<svelte:head><title>Stasiun | PomKita</title></svelte:head>
<section class="page" aria-labelledby="station-title">
	<header><p class="overline">Administrasi</p><h1 id="station-title">Stasiun</h1><p>Kelola stasiun yang digunakan dalam operasional.</p></header>
	{#if !authorized}<section class="notice" role="status"><strong>Halaman tidak tersedia untuk peran Anda.</strong><span>Hanya Owner dan Superadmin yang dapat mengelola stasiun.</span></section>
	{:else}
		{#if isOwner || isSuperadmin}<StationCreateForm />{/if}
		<section class="list" aria-label="Daftar stasiun">
			{#if stations.length}{#each stations as station (station.id)}<StationCard {station} />{/each}{:else}<p class="empty">Belum ada stasiun.</p>{/if}
		</section>
	{/if}
</section>

<style>
	.page, .list { display: grid; gap: var(--space-6); } header { display: grid; gap: var(--space-2); } h1, header p { margin: 0; } h1 { font-size: 2rem; } .overline { color: var(--color-primary); font-size: .72rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; } header p:last-child { color: var(--color-text-muted); }
	.notice { display: grid; gap: var(--space-2); padding: var(--space-5); background: var(--color-primary-soft); border: 1px solid var(--color-border); border-radius: var(--radius-md); } .notice span, .empty { color: var(--color-text-muted); }
</style>
