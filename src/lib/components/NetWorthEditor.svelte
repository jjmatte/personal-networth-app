<script lang="ts">
	import { netWorthTotals, type NetWorthRow } from '$lib/finance/networth';

	let {
		initialRows,
		takenAt,
		note = '',
		categories = []
	}: {
		initialRows: NetWorthRow[];
		takenAt: string; // yyyy-mm-dd
		note?: string;
		categories?: string[];
	} = $props();

	let rows = $state<NetWorthRow[]>(initialRows.map((r) => ({ ...r })));
	const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

	const totals = $derived(netWorthTotals(rows.map((r) => ({ side: r.side, amount: Number(r.amount) || 0 }))));
	const assetRows = $derived(rows.filter((r) => r.side === 'asset'));
	const liabilityRows = $derived(rows.filter((r) => r.side === 'liability'));

	function addRow(side: NetWorthRow['side']) {
		rows.push({ side, category: '', label: '', amount: 0, sortOrder: rows.length });
	}
	function removeRow(target: NetWorthRow) {
		rows = rows.filter((r) => r !== target);
	}
	// Serialize for the server action.
	const itemsJson = $derived(
		JSON.stringify(
			rows
				.filter((r) => r.label.trim() !== '' || Number(r.amount) > 0)
				.map((r, i) => ({ ...r, amount: Number(r.amount) || 0, sortOrder: i }))
		)
	);
</script>

<datalist id="nw-categories">
	{#each categories as c (c)}<option value={c}></option>{/each}
</datalist>

<input type="hidden" name="items" value={itemsJson} />
<div class="mb-4 flex flex-col gap-1">
	<label for="nw-date">Date</label>
	<input id="nw-date" name="takenAt" type="date" value={takenAt} required class="w-48 rounded border px-2 py-1" />
</div>

{#each [{ side: 'asset', title: 'Assets', list: assetRows }, { side: 'liability', title: 'Liabilities', list: liabilityRows }] as group (group.side)}
	<section class="mb-4">
		<h3 class="mb-2 font-medium">{group.title}</h3>
		<div class="flex flex-col gap-2">
			{#each group.list as r (r)}
				<div class="flex items-center gap-2">
					<input bind:value={r.category} list="nw-categories" placeholder="Category" class="w-32 rounded border px-2 py-1" />
					<input bind:value={r.label} placeholder="Label" class="flex-1 rounded border px-2 py-1" />
					<input bind:value={r.amount} type="number" step="any" min="0" placeholder="Amount" class="w-32 rounded border px-2 py-1" />
					<button type="button" onclick={() => removeRow(r)} aria-label="Remove row">✕</button>
				</div>
			{/each}
		</div>
		<button type="button" onclick={() => addRow(group.side as NetWorthRow['side'])} class="mt-2 rounded border px-2 py-1 text-sm hover:bg-gray-50">
			Add {group.side}
		</button>
	</section>
{/each}

<div class="mb-4 flex flex-col gap-1">
	<label for="nw-note">Note</label>
	<input id="nw-note" name="note" value={note} class="w-full rounded border px-2 py-1" />
</div>

<p class="mb-4 text-lg font-medium">
	Net worth: {money.format(totals.net)}
	<span class="text-sm text-gray-500">({money.format(totals.assets)} − {money.format(totals.liabilities)})</span>
</p>
