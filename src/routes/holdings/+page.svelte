<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();
	let editingId = $state<number | null>(null);

	const money = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 0
	});

	function categoryName(categoryId: number | null) {
		if (categoryId === null) return 'Uncategorized';
		return data.categories.find((c) => c.id === categoryId)?.name ?? 'Uncategorized';
	}
</script>

<main class="mx-auto max-w-3xl p-6">
	<h1 class="mb-4 text-2xl font-semibold">Holdings</h1>

	{#if form?.error}
		<p class="mb-4 rounded bg-red-100 p-3 text-red-900">{form.error}</p>
	{/if}

	<div class="mb-6 divide-y rounded border">
		{#each data.holdings as holding (holding.id)}
			<div class="flex items-center gap-2 p-2">
				{#if editingId === holding.id}
					<form
						method="POST"
						action="?/update"
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
						<select name="categoryId" class="rounded border px-2 py-1">
							<option value="">Uncategorized</option>
							{#each data.categories as category (category.id)}
								<option value={category.id} selected={category.id === holding.categoryId}>
									{category.name}
								</option>
							{/each}
						</select>
						<button type="submit">Save</button>
						<button type="button" onclick={() => (editingId = null)}>Cancel</button>
					</form>
				{:else}
					<a class="w-20" href={`/holdings/${holding.id}`}>{holding.symbol}</a>
					<span class="flex-1">{holding.name}</span>
					<span class="w-32">{categoryName(holding.categoryId)}</span>
					<span class="w-24">{money.format(holding.currentValue)}</span>
					<button type="button" onclick={() => (editingId = holding.id)}>Edit</button>
				{/if}
				<form method="POST" action="?/setValue" use:enhance class="flex items-center gap-2">
					<input type="hidden" name="id" value={holding.id} />
					<input
						name="value"
						type="number"
						step="0.01"
						required
						aria-label={`New value for ${holding.symbol}`}
						class="w-24 rounded border px-2 py-1"
					/>
					<button type="submit" aria-label={`Update ${holding.symbol} value`}>Update value</button>
				</form>
			</div>
		{/each}
	</div>

	<form method="POST" action="?/create" use:enhance class="flex flex-col gap-3 rounded border p-4">
		<h2 class="font-medium">Add holding</h2>
		<div class="flex flex-col gap-1">
			<label for="holding-symbol">Symbol</label>
			<input id="holding-symbol" name="symbol" required class="rounded border px-2 py-1" />
		</div>
		<div class="flex flex-col gap-1">
			<label for="holding-name">Name</label>
			<input id="holding-name" name="name" required class="rounded border px-2 py-1" />
		</div>
		<div class="flex flex-col gap-1">
			<label for="holding-category">Category</label>
			<select id="holding-category" name="categoryId" class="rounded border px-2 py-1">
				<option value="">Uncategorized</option>
				{#each data.categories as category (category.id)}
					<option value={category.id}>{category.name}</option>
				{/each}
			</select>
		</div>
		<button type="submit">Add holding</button>
	</form>
</main>
