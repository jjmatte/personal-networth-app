<script lang="ts">
	import AllocationChart from '$lib/components/AllocationChart.svelte';

	let { data } = $props();

	const money = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 0
	});
</script>

<main class="mx-auto max-w-3xl p-6">
	<h1 class="mb-4 text-2xl font-semibold">Dashboard</h1>

	<div class="mb-6 flex gap-6">
		<div class="text-lg font-medium">Total value: {money.format(data.total)}</div>
		<div class="text-lg font-medium">Overall gain: {money.format(data.overallGain)}</div>
	</div>

	{#if data.targetsSum !== 100}
		<p class="mb-4 rounded bg-yellow-100 p-3 text-yellow-900">
			Targets sum to {data.targetsSum}%, not 100%.
		</p>
	{/if}

	<div class="mb-6 max-w-xs">
		<AllocationChart rows={data.rows} />
	</div>

	<table class="w-full border-collapse text-left">
		<thead>
			<tr class="border-b">
				<th class="py-1">Category</th>
				<th class="py-1">Target %</th>
				<th class="py-1">Actual %</th>
				<th class="py-1">Drift</th>
				<th class="py-1">Buy</th>
			</tr>
		</thead>
		<tbody>
			{#each data.rows as row (row.categoryId)}
				<tr class="border-b">
					<td class="py-1">{row.name}</td>
					<td class="py-1">{row.targetWeight.toFixed(1)}%</td>
					<td class="py-1">{row.actualPercent.toFixed(1)}%</td>
					<td class="py-1">{row.driftPercent.toFixed(1)}%</td>
					<td class="py-1">{row.deltaValue > 0 ? money.format(row.deltaValue) : ''}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</main>
