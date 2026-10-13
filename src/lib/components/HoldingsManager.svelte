<script lang="ts">
	import { enhance } from '$app/forms';

	let {
		holdings,
		categories,
		form
	}: {
		holdings: {
			id: number;
			symbol: string;
			name: string;
			kind: string;
			categoryId: number | null;
			currentValue: number;
			shares: number;
		}[];
		categories: { id: number; name: string }[];
		form: { holdingError?: string; priceWarning?: boolean } | null;
	} = $props();

	let editingId = $state<number | null>(null);

	const money = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 0
	});
	const sharesFmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 6 });

	function categoryName(categoryId: number | null) {
		if (categoryId === null) return 'Uncategorized';
		return categories.find((c) => c.id === categoryId)?.name ?? 'Uncategorized';
	}
</script>

{#if form?.holdingError}
	<p class="mb-4 rounded bg-red-100 p-3 text-red-900">{form.holdingError}</p>
{/if}

{#if form?.priceWarning}
	<p class="mb-4 rounded bg-amber-100 p-3 text-amber-900">
		Couldn't refresh the live price — value may be stale.
	</p>
{/if}

<div class="mb-6 divide-y rounded border">
	{#each holdings as holding (holding.id)}
		<div class="flex items-center gap-2 p-2">
			{#if editingId === holding.id}
				<form
					method="POST"
					action="?/updateHolding"
					use:enhance={() => {
						return async ({ update }) => {
							editingId = null;
							await update();
						};
					}}
					class="flex flex-1 items-center gap-2"
				>
					<input type="hidden" name="id" value={holding.id} />
					<input name="symbol" value={holding.symbol} class="w-20 rounded border px-2 py-1" />
					<input name="name" value={holding.name} class="flex-1 rounded border px-2 py-1" />
					<select name="kind" class="rounded border px-2 py-1">
						<option value="equity" selected={holding.kind === 'equity'}>Equity</option>
						<option value="crypto" selected={holding.kind === 'crypto'}>Crypto</option>
					</select>
					<select name="categoryId" class="rounded border px-2 py-1">
						<option value="">Uncategorized</option>
						{#each categories as category (category.id)}
							<option value={category.id} selected={category.id === holding.categoryId}>
								{category.name}
							</option>
						{/each}
					</select>
					<button type="submit">Save</button>
					<button type="button" onclick={() => (editingId = null)}>Cancel</button>
				</form>
			{:else}
				<a class="w-20 text-blue-700 underline" href={`/holdings/${holding.id}`}>{holding.symbol}</a>
				<span class="flex-1">{holding.name}</span>
				<span class="w-32">{categoryName(holding.categoryId)}</span>
				<span class="w-24">{sharesFmt.format(holding.shares)} sh</span>
				<span class="w-24">{money.format(holding.currentValue)}</span>
				<button type="button" onclick={() => (editingId = holding.id)}>Edit</button>
			{/if}
			<form method="POST" action="?/refreshHolding" use:enhance class="flex items-center gap-2">
				<input type="hidden" name="id" value={holding.id} />
				<button type="submit" aria-label={`Refresh ${holding.symbol} price`}>Refresh</button>
			</form>
		</div>
	{/each}
</div>

<form method="POST" action="?/createHolding" use:enhance class="flex flex-col gap-3 rounded border p-4">
	<h3 class="font-medium">Add holding</h3>
	<div class="flex flex-col gap-1">
		<label for="holding-symbol">Symbol</label>
		<input id="holding-symbol" name="symbol" required class="rounded border px-2 py-1" />
	</div>
	<div class="flex flex-col gap-1">
		<label for="holding-name">Name</label>
		<input id="holding-name" name="name" required class="rounded border px-2 py-1" />
	</div>
	<div class="flex flex-col gap-1">
		<label for="holding-kind">Type</label>
		<select id="holding-kind" name="kind" class="rounded border px-2 py-1">
			<option value="equity">Equity</option>
			<option value="crypto">Crypto</option>
		</select>
	</div>
	<div class="flex flex-col gap-1">
		<label for="holding-category">Category</label>
		<select id="holding-category" name="categoryId" class="rounded border px-2 py-1">
			<option value="">Uncategorized</option>
			{#each categories as category (category.id)}
				<option value={category.id}>{category.name}</option>
			{/each}
		</select>
	</div>
	<button type="submit">Add holding</button>
</form>
