<svelte:head>
	<title>Beranda | PomKita</title>
	<meta name="description" content="Ruang kerja operasional PomKita" />
</svelte:head>

<section class="page" aria-labelledby="page-title">
	<header class="page-header">
		<div>
			<p class="overline">Ringkasan operasional</p>
			<h1 id="page-title">Beranda</h1>
		</div>
	</header>

	<div class="empty-state" role="status">
		<div class="empty-icon" aria-hidden="true">—</div>
		<h2>Belum ada data</h2>
		<p>Data operasional akan tampil setelah aktivitas tersedia.</p>
	</div>
</section>

<style>
	.page {
		display: grid;
		gap: var(--space-6);
	}

	.page-header {
		display: flex;
		align-items: end;
		justify-content: space-between;
	}

	.overline {
		margin: 0 0 var(--space-2);
		color: var(--color-primary);
		font-size: 0.72rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	h1,
	h2,
	p {
		margin-top: 0;
	}

	h1 {
		margin-bottom: 0;
		font-size: clamp(1.6rem, 3vw, 2.1rem);
		letter-spacing: -0.04em;
	}

	.empty-state {
		display: grid;
		justify-items: center;
		padding: clamp(var(--space-8), 12vw, 7rem) var(--space-6);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-soft);
		text-align: center;
	}

	.empty-icon {
		display: grid;
		width: 2.5rem;
		height: 2.5rem;
		place-items: center;
		margin-bottom: var(--space-4);
		border-radius: 50%;
		background: var(--color-primary-soft);
		color: var(--color-primary);
		font-size: 1.6rem;
		font-weight: 800;
		line-height: 1;
	}

	h2 {
		margin-bottom: var(--space-2);
		font-size: 1.05rem;
	}

	.empty-state p {
		max-width: 28rem;
		margin-bottom: 0;
		color: var(--color-text-muted);
	}
</style>
