<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import NetWorthEditor from '$lib/components/NetWorthEditor.svelte';
	let { data, form } = $props();
	let editing = $state(false);
	const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
	const dateFmt = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' });
	const assets = $derived(data.items.filter((i) => i.side === 'asset'));
	const liabilities = $derived(data.items.filter((i) => i.side === 'liability'));
</script>

<main class="mx-auto max-w-2xl p-6">
	<div class="mb-4 flex items-center justify-between">
		<h1 class="text-2xl font-semibold">Net worth — {dateFmt.format(new Date(data.snapshot.takenAt))}</h1>
		<a href={`/net-worth/new?from=${data.snapshot.id}`} class="rounded border px-3 py-1 text-sm hover:bg-gray-50">New from this</a>
	</div>
	{#if form?.error}<p class="mb-4 rounded bg-red-100 p-3 text-red-900">{form.error}</p>{/if}
	{#if editing}
		<form
			method="POST"
			action="?/update"
			use:enhance={() => async ({ result, update }) => {
				await update({ reset: false });
				if (result.type === 'success') {
					await invalidateAll();
					editing = false;
				}
			}}
		>
			<NetWorthEditor
				initialRows={data.items.map((i) => ({ side: i.side as 'asset' | 'liability', category: i.category, label: i.label, amount: i.amount, sortOrder: i.sortOrder }))}
				takenAt={new Date(data.snapshot.takenAt).toISOString().slice(0, 10)}
				note={data.snapshot.note ?? ''}
			/>
			<button type="submit" class="rounded border px-4 py-2 hover:bg-gray-50">Save changes</button>
			<button type="button" onclick={() => (editing = false)} class="ml-2 rounded border px-3 py-1 text-sm">Cancel</button>
		</form>
	{:else}
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

		<div class="flex items-center gap-2">
			<button type="button" onclick={() => (editing = true)} class="rounded border px-3 py-1 text-sm hover:bg-gray-50">Edit</button>
			<form method="POST" action="?/delete" onsubmit={(e) => { if (!confirm('Delete this snapshot?')) e.preventDefault(); }}>
				<button type="submit" class="rounded border px-3 py-1 text-sm text-red-700 hover:bg-red-50">Delete</button>
			</form>
		</div>
	{/if}
</main>
