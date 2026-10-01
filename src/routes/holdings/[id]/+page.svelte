<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	const money = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 0
	});

	const today = new Date().toISOString().slice(0, 10);

	function formatDate(d: Date) {
		return new Date(d).toLocaleDateString('en-US');
	}
</script>

<main class="mx-auto max-w-3xl p-6">
	<h1 class="mb-1 text-2xl font-semibold">{data.holding.symbol}</h1>
	<p class="mb-4 text-gray-600">{data.holding.name}</p>

	{#if form?.error}
		<p class="mb-4 rounded bg-red-100 p-3 text-red-900">{form.error}</p>
	{/if}

	<div class="mb-6 flex gap-6">
		<div class="text-lg font-medium">Cost basis: {money.format(data.costBasis)}</div>
		<div class="text-lg font-medium">
			Gain: {money.format(data.gain.amount)}
			{#if data.gain.percent !== null}
				({(data.gain.percent * 100).toFixed(1)}%)
			{/if}
		</div>
	</div>

	<table class="mb-6 w-full border-collapse text-left">
		<thead>
			<tr class="border-b">
				<th class="py-1">Date</th>
				<th class="py-1">Shares</th>
				<th class="py-1">Price per share</th>
				<th class="py-1">Gain</th>
				<th class="py-1"></th>
			</tr>
		</thead>
		<tbody>
			{#each data.lots as lot (lot.id)}
				<tr class="border-b">
					<td class="py-1">{formatDate(lot.tradeDate)}</td>
					<td class="py-1">{lot.shares}</td>
					<td class="py-1">{money.format(lot.pricePerShare)}</td>
					<td class="py-1">{lot.gain === null ? 'n/a' : money.format(lot.gain)}</td>
					<td class="py-1">
						<form method="POST" action="?/removeLot" use:enhance>
							<input type="hidden" name="lotId" value={lot.id} />
							<button type="submit" aria-label={`Remove lot ${lot.id}`}>Remove</button>
						</form>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<form method="POST" action="?/addLot" use:enhance class="flex flex-col gap-3 rounded border p-4">
		<h2 class="font-medium">Add purchase</h2>
		<div class="flex flex-col gap-1">
			<label for="lot-tradeDate">Trade date</label>
			<input id="lot-tradeDate" name="tradeDate" type="date" value={today} required class="rounded border px-2 py-1" />
		</div>
		<div class="flex flex-col gap-1">
			<label for="lot-shares">Shares</label>
			<input id="lot-shares" name="shares" type="number" step="any" required class="rounded border px-2 py-1" />
		</div>
		<div class="flex flex-col gap-1">
			<label for="lot-price">Price per share</label>
			<input id="lot-price" name="pricePerShare" type="number" step="any" required class="rounded border px-2 py-1" />
		</div>
		<div class="flex flex-col gap-1">
			<label for="lot-fee">Fee</label>
			<input id="lot-fee" name="fee" type="number" step="any" class="rounded border px-2 py-1" />
		</div>
		<button type="submit">Add purchase</button>
	</form>
</main>
