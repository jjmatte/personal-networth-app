<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav class="border-b">
	<div class="mx-auto flex max-w-3xl gap-4 p-4">
		<a href="/">Dashboard</a>
		<a href="/holdings">Holdings</a>
		<a href="/categories">Categories</a>
		<a href="/history">History</a>
	</div>
</nav>

{@render children()}
