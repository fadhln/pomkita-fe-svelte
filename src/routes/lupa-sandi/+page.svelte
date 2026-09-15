<script lang="ts">
	import ForgotPasswordForm from '../../features/password/ForgotPasswordForm.svelte';
</script>

<svelte:head>
	<title>Lupa sandi | PomKita</title>
	<meta name="description" content="Atur ulang kata sandi PomKita" />
</svelte:head>

<main class="public-page">
	<div class="brand" aria-label="PomKita">PomKita</div>
	<ForgotPasswordForm />
</main>

<style>
	.public-page { display: grid; min-height: 100vh; place-items: center; align-content: center; gap: var(--space-5); padding: var(--space-4); background: var(--color-page); }
	.brand { color: var(--color-primary); font-size: 1.5rem; font-weight: 800; }
</style>
