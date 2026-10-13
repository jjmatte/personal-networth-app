<script lang="ts">
	let { data } = $props();
	const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
	const dateFmt = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });
	const assets = $derived(data.items.filter((i) => i.side === 'asset'));
	const liabilities = $derived(data.items.filter((i) => i.side === 'liability'));
</script>

<main class="mx-auto max-w-2xl p-6">
	<div class="mb-4 flex items-center justify-between">
		<h1 class="text-2xl font-semibold">Net worth — {dateFmt.format(new Date(data.snapshot.takenAt))}</h1>
		<a href={`/net-worth/new?from=${data.snapshot.id}`} class="rounded border px-3 py-1 text-sm hover:bg-gray-50">New from this</a>
	</div>
	{#if data.snapshot.note}<p class="mb-4 text-gray-600">{data.snapshot.note}</p>{/if}

	{#each [{ title: 'Assets', list: assets }, { title: 'Liabilities', list: liabilities }] as group (group.title)}
		<section class="mb-4">
			<h2 class="mb-1 font-medium">{group.title}</h2>
			<div class="divide-y rounded border">
				{#each group.list as it (it.id)}
					<div class="flex items-center gap-2 p-2">
						<span class="w-32 text-gray-500">{it.category}</span>
						<span class="flex-1">{it.label}</span>
						<span class="w-28 text-right">{money.format(it.amount)}</span>
					</div>
				{/each}
			</div>
		</section>
	{/each}

	<p class="mb-6 text-lg font-medium">
		Net worth: {money.format(data.totals.net)}
		<span class="text-sm text-gray-500">({money.format(data.totals.assets)} − {money.format(data.totals.liabilities)})</span>
	</p>

	<form method="POST" action="?/delete" onsubmit={(e) => { if (!confirm('Delete this snapshot?')) e.preventDefault(); }}>
		<button type="submit" class="rounded border px-3 py-1 text-sm text-red-700 hover:bg-red-50">Delete</button>
	</form>
</main>
