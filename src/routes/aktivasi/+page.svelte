<script lang="ts">
	import InvitationForm from '../../features/invitation/InvitationForm.svelte';

	let { data }: { data: { token: string } } = $props();
</script>

<svelte:head>
	<title>Aktivasi akun | PomKita</title>
	<meta name="description" content="Aktivasi akun PomKita" />
</svelte:head>

<main class="activation-page">
	<section class="activation-panel">
		<div class="brand" aria-label="PomKita">PomKita</div>
		<InvitationForm token={data.token} />
	</section>
</main>

<style>
	.activation-page { display: grid; min-height: 100vh; place-items: center; padding: var(--space-4); background: var(--color-page); }
	.activation-panel { display: grid; justify-items: center; width: min(100%, 30rem); gap: var(--space-5); }
	.brand { color: var(--color-primary); font-size: 1.5rem; font-weight: 800; }
</style>
