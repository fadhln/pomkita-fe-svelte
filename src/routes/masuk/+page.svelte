<script lang="ts">
	import LoginForm from '$lib/components/LoginForm.svelte';
</script>

<svelte:head>
	<title>Masuk | PomKita</title>
	<meta name="description" content="Masuk ke PomKita" />
</svelte:head>

<main class="login-page">
	<section class="login-panel">
		<div class="brand" aria-label="PomKita">PomKita</div>
		<LoginForm />
	</section>
</main>

<style>
	.login-page {
		display: grid;
		min-height: 100vh;
		place-items: center;
		padding: var(--space-4);
		background: var(--color-page);
	}

	.login-panel {
		display: grid;
		width: min(100%, 26rem);
		gap: var(--space-5);
	}

	.brand {
		color: var(--color-primary);
		font-size: 1.5rem;
		font-weight: 800;
		text-align: center;
	}

</style>
