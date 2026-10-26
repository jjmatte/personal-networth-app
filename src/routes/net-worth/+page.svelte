<script lang="ts">
	import { formatUsd } from '$lib/money';
	import NetWorthChart from '$lib/components/NetWorthChart.svelte';
	let { data } = $props();
	const dateFmt = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' });
</script>

<main class="mx-auto max-w-2xl p-6">
	<div class="mb-4 flex items-center justify-between">
		<h1 class="text-2xl font-semibold">Net worth history</h1>
		<a href="/net-worth/new" class="rounded border px-3 py-1 text-sm hover:bg-gray-50">New snapshot</a>
	</div>
	{#if data.snapshots.length === 0}
		<p class="text-gray-600">No snapshots yet. <a class="text-blue-700 underline" href="/net-worth/new">Create your first.</a></p>
	{:else}
		{#if data.series.length >= 2}
			<div data-testid="net-worth-chart" class="mb-4 h-64 rounded border p-3">
				<NetWorthChart points={data.series} />
			</div>
		{/if}
		{#if data.bestPeriodGain !== null}
			<p data-testid="best-period" class="mb-2 text-sm text-gray-600">
				Best period gain: <span class="font-medium">{data.bestPeriodGain >= 0 ? '+' : ''}{formatUsd(data.bestPeriodGain)}</span>
			</p>
		{/if}
		<div class="divide-y rounded border">
			{#each data.snapshots as s (s.id)}
				<a href={`/net-worth/${s.id}`} class="flex items-center gap-3 p-3 hover:bg-gray-50">
					<span class="w-32">{dateFmt.format(new Date(s.takenAt))}</span>
					<span class="flex-1 font-medium">{formatUsd(s.total)}</span>
					{#if s.delta !== null}
						<span data-testid="period-gain" title="Gain vs previous snapshot" class={s.delta >= 0 ? 'text-green-700' : 'text-red-700'}>
							{s.delta >= 0 ? '+' : ''}{formatUsd(s.delta)}
						</span>
						<span data-testid="running-gain" title="Total gain since first snapshot" class="w-28 text-right text-sm {s.runningGain >= 0 ? 'text-green-700' : 'text-red-700'}">
							{s.runningGain >= 0 ? '+' : ''}{formatUsd(s.runningGain)}
						</span>
					{:else}
						<span class="text-sm text-gray-500">First snapshot</span>
					{/if}
					<span class="w-16 text-right text-sm text-gray-500">{s.itemCount} items</span>
				</a>
			{/each}
		</div>
	{/if}
</main>
