<script lang="ts">
	import ResetPasswordForm from '../../features/password/ResetPasswordForm.svelte';

	let { data }: { data: { token: string } } = $props();
</script>

<svelte:head>
	<title>Atur ulang kata sandi | PomKita</title>
	<meta name="description" content="Atur ulang kata sandi PomKita" />
</svelte:head>

<main class="public-page">
	<div class="brand" aria-label="PomKita">PomKita</div>
	<ResetPasswordForm token={data.token} />
</main>

<style>
	.public-page { display: grid; min-height: 100vh; place-items: center; align-content: center; gap: var(--space-5); padding: var(--space-4); background: var(--color-page); }
	.brand { color: var(--color-primary); font-size: 1.5rem; font-weight: 800; }
</style>
