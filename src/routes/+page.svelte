<script lang="ts">
	import AllocationChart from '$lib/components/AllocationChart.svelte';
	import HistoryChart from '$lib/components/HistoryChart.svelte';
	import HoldingsManager from '$lib/components/HoldingsManager.svelte';
	import CategoriesManager from '$lib/components/CategoriesManager.svelte';

	let { data, form } = $props();

	let contribution = $state(0);
	let holdingsDialog: HTMLDialogElement;
	let categoriesDialog: HTMLDialogElement;

	const money = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 0
	});
	const moneyPrecise = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 2
	});
</script>

<main class="mx-auto max-w-5xl p-6">
	<div class="mx-auto max-w-3xl">
		<h1 class="mb-4 text-2xl font-semibold">Dashboard</h1>

		<div class="mb-6 flex items-center gap-6">
			<div class="text-lg font-medium">Total value: {money.format(data.total)}</div>
			<div class="text-lg font-medium">Overall gain: {money.format(data.overallGain)}</div>
			<form method="POST" action="?/refreshPrices">
				<button type="submit" class="rounded border px-3 py-1 text-sm hover:bg-gray-50">
					Refresh prices
				</button>
			</form>
			<button
				type="button"
				onclick={() => holdingsDialog.showModal()}
				class="rounded border px-3 py-1 text-sm hover:bg-gray-50"
			>
				Manage holdings
			</button>
			<button
				type="button"
				onclick={() => categoriesDialog.showModal()}
				class="rounded border px-3 py-1 text-sm hover:bg-gray-50"
			>
				Manage categories
			</button>
		</div>

		{#if form?.refreshed?.length}
			<p class="mb-4 rounded bg-green-100 p-3 text-green-900">
				{#each form.refreshed as r (r.symbol)}
					{r.symbol}: {moneyPrecise.format(r.price)}/share — updated to {money.format(r.value)}.
				{/each}
			</p>
		{/if}
		{#if form?.errors?.length}
			<p class="mb-4 rounded bg-red-100 p-3 text-red-900">
				{#each form.errors as e (e.symbol)}
					{e.symbol}: {e.message}
				{/each}
			</p>
		{/if}

		{#if data.targetsSum !== 100}
			<p class="mb-4 rounded bg-yellow-100 p-3 text-yellow-900">
				Targets sum to {data.targetsSum}%, not 100%.
			</p>
		{/if}

		{#if data.recommended}
			<div class="mb-6 rounded border p-4">
				<h2 class="mb-2 font-medium">Monthly contribution</h2>
				<div class="flex items-center gap-2">
					<span aria-hidden="true">$</span>
					<input
						type="number"
						min="0"
						step="1"
						aria-label="Monthly contribution"
						bind:value={contribution}
						class="w-32 rounded border px-2 py-1"
					/>
				</div>
				{#if contribution > 0}
					<p class="mt-2">
						Put {money.format(contribution)} into <strong>{data.recommended.name}</strong> — it's the
						most out of sync with its target.
					</p>
				{/if}
			</div>
		{/if}

		<table class="w-full border-collapse text-left">
			<thead>
				<tr class="border-b">
					<th class="py-1">Category</th>
					<th class="py-1">Target %</th>
					<th class="py-1">Actual %</th>
					<th class="py-1">Actual $</th>
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
						<td class="py-1">{money.format(row.actualValue)}</td>
						<td class="py-1">{row.driftPercent.toFixed(1)}%</td>
						<td class="py-1">{row.deltaValue > 0 ? money.format(row.deltaValue) : ''}</td>
					</tr>
				{/each}
			</tbody>
		</table>

		<section class="mt-8">
			<h2 class="mb-2 font-medium">Holdings</h2>
			<div class="divide-y rounded border">
				{#each data.holdings as holding (holding.id)}
					<div class="flex items-center gap-2 p-2">
						<a class="w-20 text-blue-700 underline" href={`/holdings/${holding.id}`}>
							{holding.symbol}
						</a>
						<span class="flex-1">{holding.name}</span>
						<span class="w-24">{money.format(holding.currentValue)}</span>
						<a
							href={`/holdings/${holding.id}#add-purchase`}
							aria-label={`Buy ${holding.symbol}`}
							class="rounded border px-2 py-1 text-sm hover:bg-gray-50">Buy</a
						>
					</div>
				{/each}
			</div>
		</section>
	</div>

	<div class="mt-10 grid grid-cols-1 items-start gap-8 md:grid-cols-3">
		<div>
			<h2 class="mb-2 font-medium">Allocation</h2>
			<AllocationChart rows={data.rows} />
		</div>
		<div class="md:col-span-2">
			<h2 class="mb-2 font-medium">History</h2>
			<HistoryChart series={data.series} />
		</div>
	</div>

	<dialog
		bind:this={holdingsDialog}
		class="w-full max-w-2xl rounded-lg p-0 backdrop:bg-black/40"
	>
		<div class="max-h-[85vh] overflow-auto p-6">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-xl font-semibold">Manage holdings</h2>
				<button
					type="button"
					onclick={() => holdingsDialog.close()}
					class="rounded border px-3 py-1 text-sm hover:bg-gray-50">Close</button
				>
			</div>
			<HoldingsManager holdings={data.holdings} categories={data.categories} {form} />
		</div>
	</dialog>

	<dialog
		bind:this={categoriesDialog}
		class="w-full max-w-xl rounded-lg p-0 backdrop:bg-black/40"
	>
		<div class="max-h-[85vh] overflow-auto p-6">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-xl font-semibold">Manage categories</h2>
				<button
					type="button"
					onclick={() => categoriesDialog.close()}
					class="rounded border px-3 py-1 text-sm hover:bg-gray-50">Close</button
				>
			</div>
			<CategoriesManager categories={data.categories} targetsSum={data.targetsSum} {form} />
		</div>
	</dialog>
</main>
