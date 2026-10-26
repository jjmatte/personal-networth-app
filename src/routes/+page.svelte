<script lang="ts">
	import { formatUsd } from '$lib/money';
	import NetWorthChart from '$lib/components/NetWorthChart.svelte';
	import AllocationChart from '$lib/components/AllocationChart.svelte';
	import HistoryChart from '$lib/components/HistoryChart.svelte';
	let { data } = $props();
	const dateFmt = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' });

	const hasNetWorthSeries = $derived(data.netWorthSeries.length >= 2);
	const hasAllocation = $derived(data.allocationRows.some((r) => r.actualValue > 0));
	const hasHistory = $derived(data.historySeries.some((s) => s.points.length > 0));
</script>

<main class="mx-auto max-w-6xl px-6 py-8 lg:px-10">
	<header class="mb-7 flex items-end justify-between gap-4">
		<div>
			<h1 class="text-3xl font-semibold tracking-tight">Overview</h1>
			{#if data.netWorth}
				<p class="mt-1 text-sm text-muted">As of {dateFmt.format(new Date(data.netWorth.takenAt))}</p>
			{/if}
		</div>
		<a href="/net-worth/new" class="inline-flex items-center rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-bright">New snapshot</a>
	</header>

	<div class="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
		<a href="/net-worth" class="card group p-6 transition-shadow hover:shadow-md">
			<div class="text-sm font-medium text-muted">Net worth</div>
			{#if data.netWorth}
				<div class="mt-1 font-display text-5xl font-semibold tracking-tight tnum">{formatUsd(data.netWorth.total)}</div>
				{#if data.netWorth.delta !== null}
					<div class="mt-2 inline-flex items-center gap-1 text-sm font-medium tnum {data.netWorth.delta >= 0 ? 'text-gain' : 'text-loss'}">
						<span aria-hidden="true">{data.netWorth.delta >= 0 ? '▲' : '▼'}</span>
						{data.netWorth.delta >= 0 ? '+' : ''}{formatUsd(data.netWorth.delta)}
						<span class="text-muted">since last snapshot</span>
					</div>
				{/if}
			{:else}
				<div class="mt-2 text-muted">No snapshots yet.</div>
			{/if}
		</a>

		<a href="/investments" class="card group p-6 transition-shadow hover:shadow-md">
			<div class="text-sm font-medium text-muted">Investments</div>
			<div class="mt-1 font-display text-5xl font-semibold tracking-tight tnum">{formatUsd(data.investments.total)}</div>
			<div class="mt-2 inline-flex items-center gap-1 text-sm font-medium tnum {data.investments.overallGain >= 0 ? 'text-gain' : 'text-loss'}">
				<span aria-hidden="true">{data.investments.overallGain >= 0 ? '▲' : '▼'}</span>
				{data.investments.overallGain >= 0 ? '+' : ''}{formatUsd(data.investments.overallGain)}
				<span class="text-muted">overall gain</span>
			</div>
		</a>
	</div>

	{#if hasNetWorthSeries}
		<section class="card mb-6 p-6">
			<h2 class="mb-4 text-lg font-semibold">Net worth over time</h2>
			<div class="h-80">
				<NetWorthChart points={data.netWorthSeries} />
			</div>
		</section>
	{/if}

	{#if hasAllocation || hasHistory}
		<div class="grid grid-cols-1 gap-5 lg:grid-cols-3">
			{#if hasAllocation}
				<section class="card p-6">
					<h2 class="mb-4 text-lg font-semibold">Allocation</h2>
					<AllocationChart rows={data.allocationRows} />
				</section>
			{/if}
			{#if hasHistory}
				<section class="card p-6 {hasAllocation ? 'lg:col-span-2' : 'lg:col-span-3'}">
					<h2 class="mb-4 text-lg font-semibold">Investment history</h2>
					<HistoryChart series={data.historySeries} />
				</section>
			{/if}
		</div>
	{/if}
</main>
