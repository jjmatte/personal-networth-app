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
		<a href="/">Home</a>
		<a href="/investments">Investments</a>
		<a href="/net-worth">Net Worth</a>
		<a href="/fire">FIRE</a>
		<a href="/purchases">Purchases</a>
	</div>
</nav>

{@render children()}
