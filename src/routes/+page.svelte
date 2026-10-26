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

<main class="mx-auto max-w-3xl p-6">
	<h1 class="mb-6 text-2xl font-semibold">Home</h1>
	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
		<a href="/investments" class="block rounded-lg border p-5 hover:bg-gray-50">
			<h2 class="mb-2 font-medium">Investments</h2>
			<div class="text-2xl font-semibold">{formatUsd(data.investments.total)}</div>
			<div class="text-sm text-gray-600">Overall gain {formatUsd(data.investments.overallGain)}</div>
		</a>

		<a href="/net-worth" class="block rounded-lg border p-5 hover:bg-gray-50">
			<h2 class="mb-2 font-medium">Net Worth</h2>
			{#if data.netWorth}
				<div class="text-2xl font-semibold">{formatUsd(data.netWorth.total)}</div>
				<div class="text-sm text-gray-600">
					as of {dateFmt.format(new Date(data.netWorth.takenAt))}
					{#if data.netWorth.delta !== null}
						· <span class={data.netWorth.delta >= 0 ? 'text-green-700' : 'text-red-700'}>
							{data.netWorth.delta >= 0 ? '+' : ''}{formatUsd(data.netWorth.delta)}
						</span>
					{/if}
				</div>
			{:else}
				<div class="text-sm text-gray-600">No snapshots yet.</div>
			{/if}
		</a>
	</div>

	{#if hasNetWorthSeries}
		<section class="mt-6">
			<h2 class="mb-2 font-medium">Net worth over time</h2>
			<div class="h-64 rounded border p-3">
				<NetWorthChart points={data.netWorthSeries} />
			</div>
		</section>
	{/if}

	{#if hasAllocation || hasHistory}
		<div class="mt-6 grid grid-cols-1 items-start gap-8 md:grid-cols-3">
			{#if hasAllocation}
				<section>
					<h2 class="mb-2 font-medium">Allocation</h2>
					<AllocationChart rows={data.allocationRows} />
				</section>
			{/if}
			{#if hasHistory}
				<section class={hasAllocation ? 'md:col-span-2' : 'md:col-span-3'}>
					<h2 class="mb-2 font-medium">Investment history</h2>
					<HistoryChart series={data.historySeries} />
				</section>
			{/if}
		</div>
	{/if}

	<div class="mt-6 flex gap-3">
		<a href="/net-worth/new" class="rounded border px-3 py-1 text-sm hover:bg-gray-50">New snapshot</a>
	</div>
</main>
