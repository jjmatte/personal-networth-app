<script lang="ts">
	let { data } = $props();
	const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
	const dateFmt = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });
</script>

<main class="mx-auto max-w-3xl p-6">
	<h1 class="mb-6 text-2xl font-semibold">Home</h1>
	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
		<a href="/investments" class="block rounded-lg border p-5 hover:bg-gray-50">
			<h2 class="mb-2 font-medium">Investments</h2>
			<div class="text-2xl font-semibold">{money.format(data.investments.total)}</div>
			<div class="text-sm text-gray-600">Overall gain {money.format(data.investments.overallGain)}</div>
		</a>

		<a href="/net-worth" class="block rounded-lg border p-5 hover:bg-gray-50">
			<h2 class="mb-2 font-medium">Net Worth</h2>
			{#if data.netWorth}
				<div class="text-2xl font-semibold">{money.format(data.netWorth.total)}</div>
				<div class="text-sm text-gray-600">
					as of {dateFmt.format(new Date(data.netWorth.takenAt))}
					{#if data.netWorth.delta !== null}
						· <span class={data.netWorth.delta >= 0 ? 'text-green-700' : 'text-red-700'}>
							{data.netWorth.delta >= 0 ? '+' : ''}{money.format(data.netWorth.delta)}
						</span>
					{/if}
				</div>
			{:else}
				<div class="text-sm text-gray-600">No snapshots yet.</div>
			{/if}
		</a>
	</div>
	<div class="mt-6 flex gap-3">
		<a href="/net-worth/new" class="rounded border px-3 py-1 text-sm hover:bg-gray-50">New snapshot</a>
	</div>
</main>
