<script lang="ts">
	import type { Snippet } from 'svelte';
	import Sidebar from './Sidebar.svelte';
	import Topbar from './Topbar.svelte';

	let { children, session }: { children?: Snippet; session?: { roles?: string[] | null } | null } = $props();
</script>

<div class="shell">
	<Sidebar {session} />
	<div class="main-area">
		<Topbar />
		<main class="content">{@render children?.()}</main>
	</div>
</div>

<style>
	.shell {
		min-height: 100vh;
		background: var(--color-page);
		color: var(--color-text);
	}

	.main-area {
		min-height: 100vh;
		margin-left: var(--sidebar-width);
	}

	.content {
		max-width: var(--content-max-width);
		margin: 0 auto;
		padding: var(--space-8);
	}

	@media (max-width: 48rem) {
		.main-area {
			margin-left: 0;
		}

		.content {
			padding: var(--space-5) var(--space-4);
		}
	}
</style>
