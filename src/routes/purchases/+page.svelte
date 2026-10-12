<script lang="ts">
	import { filterPurchases, sortPurchases, type SortKey } from '$lib/purchases';

	let { data } = $props();

	let query = $state('');
	let sortKey = $state<SortKey>('date');
	let sortDir = $state<'asc' | 'desc'>('desc');

	const money = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 2
	});

	const rows = $derived(sortPurchases(filterPurchases(data.purchases, query), sortKey, sortDir));

	function toggleSort(key: SortKey) {
		if (sortKey === key) {
			sortDir = sortDir === 'asc' ? 'desc' : 'asc';
		} else {
			sortKey = key;
			sortDir = key === 'date' ? 'desc' : 'asc';
		}
	}

	function indicator(key: SortKey) {
		if (sortKey !== key) return '';
		return sortDir === 'asc' ? ' ▲' : ' ▼';
	}

	function formatDate(d: string | Date) {
		return new Date(d).toLocaleDateString('en-US');
	}
</script>

<main class="mx-auto max-w-4xl p-6">
	<h1 class="mb-4 text-2xl font-semibold">Purchases</h1>

	<input
		type="search"
		placeholder="Search by symbol or name"
		aria-label="Search purchases"
		bind:value={query}
		class="mb-4 w-full max-w-sm rounded border px-3 py-2"
	/>

	<table class="w-full border-collapse text-left">
		<thead>
			<tr class="border-b">
				<th class="py-1">
					<button type="button" class="font-medium" onclick={() => toggleSort('date')}>
						Date{indicator('date')}
					</button>
				</th>
				<th class="py-1">
					<button type="button" class="font-medium" onclick={() => toggleSort('symbol')}>
						Symbol{indicator('symbol')}
					</button>
				</th>
				<th class="py-1">Name</th>
				<th class="py-1">
					<button type="button" class="font-medium" onclick={() => toggleSort('shares')}>
						Shares{indicator('shares')}
					</button>
				</th>
				<th class="py-1">
					<button type="button" class="font-medium" onclick={() => toggleSort('price')}>
						Price/share{indicator('price')}
					</button>
				</th>
				<th class="py-1">Fee</th>
				<th class="py-1">
					<button type="button" class="font-medium" onclick={() => toggleSort('cost')}>
						Cost{indicator('cost')}
					</button>
				</th>
			</tr>
		</thead>
		<tbody>
			{#each rows as row (row.id)}
				<tr class="border-b">
					<td class="py-1">{formatDate(row.tradeDate)}</td>
					<td class="py-1">
						<a class="text-blue-700 underline" href={`/holdings/${row.holdingId}`}>{row.symbol}</a>
					</td>
					<td class="py-1">{row.name}</td>
					<td class="py-1">{row.shares}</td>
					<td class="py-1">{money.format(row.pricePerShare)}</td>
					<td class="py-1">{row.fee ? money.format(row.fee) : '—'}</td>
					<td class="py-1">{money.format(row.cost)}</td>
				</tr>
			{/each}
		</tbody>
	</table>

	{#if rows.length === 0}
		<p class="mt-4 text-gray-600">No purchases{query ? ' match your search' : ' yet'}.</p>
	{/if}
</main>
