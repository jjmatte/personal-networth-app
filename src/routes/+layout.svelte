<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';

	let { children } = $props();

	const nav = [
		{ href: '/', label: 'Home' },
		{ href: '/investments', label: 'Investments' },
		{ href: '/net-worth', label: 'Net Worth' },
		{ href: '/fire', label: 'FIRE' },
		{ href: '/purchases', label: 'Purchases' }
	];

	const path = $derived($page.url.pathname);
	const isActive = (href: string) => (href === '/' ? path === '/' : path.startsWith(href));
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen bg-canvas md:flex">
	<aside
		class="bg-ink text-white md:sticky md:top-0 md:flex md:h-screen md:w-60 md:shrink-0 md:flex-col"
	>
		<div class="flex items-center gap-2.5 px-5 py-5">
			<span class="grid h-7 w-7 place-items-center rounded-full bg-brand-bright text-sm font-semibold text-ink">◆</span>
			<span class="font-display text-lg font-semibold tracking-tight">Networth</span>
		</div>
		<nav class="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:gap-0.5 md:overflow-visible md:pb-0">
			{#each nav as item (item.href)}
				<a
					href={item.href}
					aria-current={isActive(item.href) ? 'page' : undefined}
					class="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors
						{isActive(item.href)
						? 'bg-white/10 text-white'
						: 'text-white/60 hover:bg-white/5 hover:text-white/90'}"
				>
					{item.label}
				</a>
			{/each}
		</nav>
		<div class="mt-auto hidden px-5 py-4 text-xs text-white/40 md:block">Local data only</div>
	</aside>

	<div class="min-w-0 flex-1">
		{@render children()}
	</div>
</div>
