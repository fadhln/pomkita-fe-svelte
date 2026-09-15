<header class="topbar">
	<div>
		<p class="topbar-label">Ruang kerja</p>
		<p class="topbar-title">Operasional harian</p>
	</div>
	<p class="connection-status"><span class="status-dot" aria-hidden="true"></span>Terhubung</p>
</header>

<style>
	.topbar {
		position: sticky;
		top: 0;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-height: var(--topbar-height);
		padding: 0 var(--space-8);
		background: var(--color-surface);
		border-bottom: 1px solid var(--color-border);
	}

	.topbar-label {
		margin: 0;
		color: var(--color-text-muted);
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.topbar-title {
		margin: 0.2rem 0 0;
		font-size: 0.9rem;
		font-weight: 700;
	}

	.connection-status {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin: 0;
		color: var(--color-text-muted);
		font-size: 0.78rem;
		font-variant-numeric: var(--font-variant-numeric);
	}

	.status-dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background: var(--color-success);
	}

	@media (max-width: 48rem) {
		.topbar {
			padding: 0 var(--space-4);
		}
	}
</style>
