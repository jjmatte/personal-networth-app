<script lang="ts">
	import { enhance } from '$app/forms';

	let {
		incomeYears,
		personIncomes,
		form
	}: {
		incomeYears: {
			id: number;
			year: number;
			estimatedIncome: number;
			investmentIncome: number;
			netMonthlyMargin: number;
		}[];
		personIncomes: { id: number; year: number; name: string; amount: number }[];
		form: { incomeError?: string } | null;
	} = $props();
</script>

{#if form?.incomeError}<p class="mb-2 text-red-700">{form.incomeError}</p>{/if}

<h3 class="mb-2 font-medium">Income years</h3>
<div class="divide-y rounded border">
	{#each incomeYears as m (m.id)}
		<form method="POST" use:enhance class="flex items-center gap-2 p-2" data-testid="income-year-row" data-year={m.year}>
			<input type="hidden" name="id" value={m.id} />
			<input type="number" name="year" aria-label="Year" step="1" value={m.year} readonly tabindex="-1" required class="w-24 rounded border bg-gray-100 px-2 py-1 text-gray-500" />
			<input type="number" name="estimatedIncome" aria-label="Estimated income" min="0" step="0.01" value={m.estimatedIncome} required class="w-32 rounded border px-2 py-1" />
			<input type="number" name="investmentIncome" aria-label="Investment income" min="0" step="0.01" value={m.investmentIncome} required class="w-32 rounded border px-2 py-1" />
			<input type="number" name="netMonthlyMargin" aria-label="Net monthly margin" min="0" step="0.01" value={m.netMonthlyMargin} required class="w-32 rounded border px-2 py-1" />
			<button formaction="?/upsertIncomeYear" class="rounded border px-2 py-1 text-sm hover:bg-gray-50">Save</button>
			<button formaction="?/deleteIncomeYear" formnovalidate class="rounded border px-2 py-1 text-sm hover:bg-gray-50">Delete</button>
		</form>
	{/each}
</div>
<form method="POST" action="?/upsertIncomeYear" use:enhance class="mt-4 flex items-center gap-2" data-testid="add-income-year">
	<input type="number" name="year" aria-label="Year" placeholder="Year" step="1" required class="w-24 rounded border px-2 py-1" />
	<input type="number" name="estimatedIncome" aria-label="Estimated income" placeholder="Estimated" min="0" step="0.01" required class="w-32 rounded border px-2 py-1" />
	<input type="number" name="investmentIncome" aria-label="Investment income" placeholder="Investment" min="0" step="0.01" required class="w-32 rounded border px-2 py-1" />
	<input type="number" name="netMonthlyMargin" aria-label="Net monthly margin" placeholder="Net margin/mo" min="0" step="0.01" required class="w-32 rounded border px-2 py-1" />
	<button type="submit" class="rounded border px-3 py-1 text-sm hover:bg-gray-50">Add income year</button>
</form>

<h3 class="mt-6 mb-2 font-medium">Person income</h3>
<div class="divide-y rounded border">
	{#each personIncomes as m (m.id)}
		<form method="POST" use:enhance class="flex items-center gap-2 p-2" data-testid="person-income-row" data-year={m.year}>
			<input type="hidden" name="id" value={m.id} />
			<input type="number" name="year" aria-label="Year" step="1" value={m.year} required class="w-24 rounded border px-2 py-1" />
			<input name="name" aria-label="Name" value={m.name} required class="flex-1 rounded border px-2 py-1" />
			<input type="number" name="amount" aria-label="Amount" min="0" step="0.01" value={m.amount} required class="w-32 rounded border px-2 py-1" />
			<button formaction="?/upsertPersonIncome" class="rounded border px-2 py-1 text-sm hover:bg-gray-50">Save</button>
			<button formaction="?/deletePersonIncome" formnovalidate class="rounded border px-2 py-1 text-sm hover:bg-gray-50">Delete</button>
		</form>
	{/each}
</div>
<form method="POST" action="?/upsertPersonIncome" use:enhance class="mt-4 flex items-center gap-2" data-testid="add-person-income">
	<input type="number" name="year" aria-label="Year" placeholder="Year" step="1" required class="w-24 rounded border px-2 py-1" />
	<input name="name" aria-label="Name" placeholder="Name" required class="flex-1 rounded border px-2 py-1" />
	<input type="number" name="amount" aria-label="Amount" placeholder="Amount" min="0" step="0.01" required class="w-32 rounded border px-2 py-1" />
	<button type="submit" class="rounded border px-3 py-1 text-sm hover:bg-gray-50">Add person income</button>
</form>
