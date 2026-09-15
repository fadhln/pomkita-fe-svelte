<script lang="ts">
	type NavigationItem = {
		label: string;
		href: string;
	};

	const navigation: NavigationItem[] = [
		{ label: 'Beranda', href: '/' },
		{ label: 'Shift', href: '/shift' },
		{ label: 'Laporan', href: '/laporan' },
		{ label: 'Kepatuhan', href: '/kepatuhan' },
		{ label: 'Kebijakan', href: '/kebijakan' },
		{ label: 'Audit', href: '/audit' },
		{ label: 'Anomali', href: '/anomali' },
		{ label: 'Pengaturan', href: '/pengaturan' }
	];
</script>

<aside class="sidebar" aria-label="Navigasi utama">
	<div class="brand-block">
		<a class="brand" href="/">PomKita</a>
		<p class="product-label">Operasional SPBU</p>
	</div>

	<nav aria-label="Menu utama">
		<p class="menu-label">Menu</p>
		<ul>
			{#each navigation as item}
				<li>
					<a class:active={item.href === '/'} href={item.href} aria-current={item.href === '/' ? 'page' : undefined}>
						{item.label}
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<div class="sidebar-footer">
		<span class="status-dot" aria-hidden="true"></span>
		<span>Sistem aktif</span>
	</div>
</aside>

<style>
	.sidebar {
		position: fixed;
		inset: 0 auto 0 0;
		display: flex;
		width: var(--sidebar-width);
		flex-direction: column;
		padding: var(--space-6) var(--space-3) var(--space-4);
		background: var(--color-surface);
		border-right: 1px solid var(--color-border);
	}

	.brand-block {
		padding: 0 var(--space-3) var(--space-6);
	}

	.brand {
		color: var(--color-primary);
		font-size: 1.2rem;
		font-weight: 800;
		letter-spacing: -0.03em;
		text-decoration: none;
	}

	.product-label,
	.menu-label {
		margin: 0;
		color: var(--color-text-muted);
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.product-label {
		margin-top: var(--space-1);
	}

	.menu-label {
		padding: 0 var(--space-3) var(--space-2);
	}

	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	nav a {
		display: block;
		margin: 0.15rem 0;
		padding: 0.62rem var(--space-3);
		border-radius: var(--radius-sm);
		color: var(--color-text-muted);
		font-size: 0.88rem;
		font-weight: 600;
		text-decoration: none;
	}

	nav a:hover,
	nav a:focus-visible,
	nav a.active {
		background: var(--color-primary-soft);
		color: var(--color-primary);
	}

	.sidebar-footer {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin-top: auto;
		padding: var(--space-3);
		color: var(--color-text-muted);
		font-size: 0.75rem;
	}

	.status-dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background: var(--color-success);
	}

	@media (max-width: 48rem) {
		.sidebar {
			position: static;
			width: auto;
			min-height: auto;
			padding: var(--space-4);
		}

		.brand-block {
			padding-bottom: var(--space-4);
		}

		.sidebar-footer {
			display: none;
		}
	}
</style>
