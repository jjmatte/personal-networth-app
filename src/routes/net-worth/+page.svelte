<script lang="ts">
	let { data } = $props();
	const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
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
		<div class="divide-y rounded border">
			{#each data.snapshots as s (s.id)}
				<a href={`/net-worth/${s.id}`} class="flex items-center gap-3 p-3 hover:bg-gray-50">
					<span class="w-32">{dateFmt.format(new Date(s.takenAt))}</span>
					<span class="flex-1 font-medium">{money.format(s.total)}</span>
					{#if s.delta !== null}
						<span class={s.delta >= 0 ? 'text-green-700' : 'text-red-700'}>
							{s.delta >= 0 ? '+' : ''}{money.format(s.delta)}
						</span>
					{/if}
					<span class="w-16 text-right text-sm text-gray-500">{s.itemCount} items</span>
				</a>
			{/each}
		</div>
	{/if}
</main>
