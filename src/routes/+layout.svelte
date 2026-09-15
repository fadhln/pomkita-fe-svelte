<script lang="ts">
	import type { Snippet } from 'svelte';
	import favicon from '$lib/assets/favicon.svg';
	import AppShell from '$lib/components/AppShell.svelte';
	import { installSessionExpiryRedirect } from '$lib/session/guard';
	import '../app.css';

	let { data, children } = $props<{ data: { isLogin: boolean; session?: import('$lib/session/api').Session | null; activeStationId?: string; stations?: import('$lib/station/active').StationOption[] }; children?: Snippet }>();

	$effect(() => installSessionExpiryRedirect());
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if data.isLogin}
	{@render children?.()}
{:else}
	<AppShell session={data.session} activeStationId={data.activeStationId} stations={data.stations}>
		{@render children?.()}
	</AppShell>
{/if}
