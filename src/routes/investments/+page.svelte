<script lang="ts">
	import AllocationChart from '$lib/components/AllocationChart.svelte';
	import HistoryChart from '$lib/components/HistoryChart.svelte';
	import HoldingsManager from '$lib/components/HoldingsManager.svelte';
	import AccountsManager from '$lib/components/AccountsManager.svelte';
	import CategoriesManager from '$lib/components/CategoriesManager.svelte';
	import { enhance } from '$app/forms';
	import { formatUsd } from '$lib/money';

	let { data, form } = $props();

	let contribution = $state(0);
	let holdingsDialog: HTMLDialogElement;
	let categoriesDialog: HTMLDialogElement;
	let accountsDialog: HTMLDialogElement;
	let buyDialog: HTMLDialogElement;
	let buyCategory = $state<{ id: number | null; name: string } | null>(null);
	let buyHoldingId = $state<number | null>(null);
	let buyPrice = $state<number | ''>('');
	let buyPriceError = $state<string | null>(null);
	let buyFetching = $state(false);

	const today = new Date().toISOString().slice(0, 10);

	const moneyPrecise = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 2
	});
	const sharesFmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 6 });

	function holdingsInCategory(categoryId: number | null) {
		return data.holdings.filter((h) => h.categoryId === categoryId);
	}

	function openBuy(categoryId: number | null, name: string) {
		buyCategory = { id: categoryId, name };
		buyHoldingId = holdingsInCategory(categoryId)[0]?.id ?? null;
		buyPrice = '';
		buyPriceError = null;
		buyDialog.showModal();
	}

	async function useTodaysBuyPrice() {
		if (buyHoldingId == null) return;
		buyFetching = true;
		buyPriceError = null;
		try {
			const res = await fetch(`/holdings/${buyHoldingId}/price`);
			const body = await res.json();
			if (!res.ok || body.error) {
				buyPriceError = body.error ?? 'Could not fetch price';
				return;
			}
			buyPrice = body.price;
		} catch {
			buyPriceError = 'Could not fetch price';
		} finally {
			buyFetching = false;
		}
	}
</script>

<main class="mx-auto max-w-6xl px-6 py-8 lg:px-10">
	<div class="mx-auto max-w-5xl">
		<h1 class="mb-4 text-2xl font-semibold">Dashboard</h1>

		<div class="mb-6 flex items-center gap-6">
			<div class="text-lg font-medium">Total value: {formatUsd(data.total)}</div>
			<div class="text-lg font-medium">Overall gain: {formatUsd(data.overallGain)}</div>
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
			<button
				type="button"
				onclick={() => accountsDialog.showModal()}
				class="rounded border px-3 py-1 text-sm hover:bg-gray-50"
			>
				Manage accounts
			</button>
		</div>

		{#if form?.refreshed?.length}
			<p class="mb-4 rounded bg-green-100 p-3 text-green-900">
				{#each form.refreshed as r (r.symbol)}
					{r.symbol}: {moneyPrecise.format(r.price)}/share — updated to {formatUsd(r.value)}.
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
						Put {formatUsd(contribution)} into <strong>{data.recommended.name}</strong> — it's the
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
						<td class="py-1">{formatUsd(row.actualValue)}</td>
						<td class="py-1">{row.driftPercent.toFixed(1)}%</td>
						<td class="py-1">
							{#if holdingsInCategory(row.categoryId).length > 0}
								<div class="flex items-center gap-2">
									<button
										type="button"
										onclick={() => openBuy(row.categoryId, row.name)}
										aria-label={`Buy in ${row.name}`}
										class="rounded border px-2 py-1 text-sm hover:bg-gray-50">Buy</button
									>
									{#if row.deltaValue > 0}
										<span class="text-sm text-gray-500">{formatUsd(row.deltaValue)}</span>
									{/if}
								</div>
							{:else if row.deltaValue > 0}
								<span class="text-sm text-gray-500">{formatUsd(row.deltaValue)}</span>
							{/if}
						</td>
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
						<span class="w-24">{sharesFmt.format(holding.shares)} sh</span>
						<span class="w-24">{formatUsd(holding.currentValue)}</span>
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
			<HoldingsManager
				holdings={data.holdings}
				categories={data.categories}
				accounts={data.accounts}
				{form}
			/>
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

	<dialog
		bind:this={accountsDialog}
		class="w-full max-w-xl rounded-lg p-0 backdrop:bg-black/40"
	>
		<div class="max-h-[85vh] overflow-auto p-6">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-xl font-semibold">Manage accounts</h2>
				<button
					type="button"
					onclick={() => accountsDialog.close()}
					class="rounded border px-3 py-1 text-sm hover:bg-gray-50">Close</button
				>
			</div>
			<AccountsManager accounts={data.accounts} {form} />
		</div>
	</dialog>

	<dialog bind:this={buyDialog} class="w-full max-w-md rounded-lg p-0 backdrop:bg-black/40">
		<div class="max-h-[85vh] overflow-auto p-6">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-xl font-semibold">Buy in {buyCategory?.name}</h2>
				<button
					type="button"
					onclick={() => buyDialog.close()}
					class="rounded border px-3 py-1 text-sm hover:bg-gray-50">Close</button
				>
			</div>

			{#if form?.buyError}
				<p class="mb-4 rounded bg-red-100 p-3 text-red-900">{form.buyError}</p>
			{/if}
			{#if form?.buyWarning}
				<p class="mb-4 rounded bg-amber-100 p-3 text-amber-900">
					Saved, but couldn't refresh the live price — value may be stale.
				</p>
			{/if}

			{#if buyCategory}
				<form
					method="POST"
					action="?/buy"
					use:enhance={() => {
						return async ({ update, result }) => {
							await update();
							if (result.type === 'success') buyDialog.close();
						};
					}}
					class="flex flex-col gap-3"
				>
					<input type="hidden" name="holdingId" value={buyHoldingId} />
					<div class="flex flex-col gap-1">
						<label for="buy-holding">Holding</label>
						<select
							id="buy-holding"
							bind:value={buyHoldingId}
							onchange={() => {
								buyPrice = '';
								buyPriceError = null;
							}}
							class="rounded border px-2 py-1"
						>
							{#each holdingsInCategory(buyCategory.id) as h (h.id)}
								<option value={h.id}>{h.symbol} - {h.name}</option>
							{/each}
						</select>
					</div>
					<div class="flex flex-col gap-1">
						<label for="buy-date">Trade date</label>
						<input
							id="buy-date"
							name="tradeDate"
							type="date"
							value={today}
							required
							class="rounded border px-2 py-1"
						/>
					</div>
					<div class="flex flex-col gap-1">
						<label for="buy-shares">Shares</label>
						<input
							id="buy-shares"
							name="shares"
							type="number"
							step="any"
							required
							class="rounded border px-2 py-1"
						/>
					</div>
					<div class="flex flex-col gap-1">
						<label for="buy-price">Price per share</label>
						<div class="flex items-center gap-2">
							<input
								id="buy-price"
								name="pricePerShare"
								type="number"
								step="any"
								required
								bind:value={buyPrice}
								class="flex-1 rounded border px-2 py-1"
							/>
							<button
								type="button"
								onclick={useTodaysBuyPrice}
								disabled={buyFetching}
								class="whitespace-nowrap rounded border px-2 py-1 text-sm hover:bg-gray-50 disabled:opacity-50"
							>
								{buyFetching ? 'Fetching…' : "Use today's price"}
							</button>
						</div>
						{#if buyPriceError}
							<p class="rounded bg-amber-100 p-2 text-sm text-amber-900">
								Couldn't fetch today's price ({buyPriceError}) — enter it manually.
							</p>
						{/if}
					</div>
					<div class="flex flex-col gap-1">
						<label for="buy-fee">Fee</label>
						<input id="buy-fee" name="fee" type="number" step="0.01" min="0" class="rounded border px-2 py-1" />
					</div>
					<button type="submit">Add purchase</button>
				</form>
			{/if}
		</div>
	</dialog>
</main>
