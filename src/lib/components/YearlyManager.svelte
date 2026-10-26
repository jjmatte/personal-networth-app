<script lang="ts">
	import { enhance } from '$app/forms';

	let {
		manualYears,
		form
	}: {
		manualYears: { id: number; year: number; netWorth: number }[];
		form: { yearError?: string } | null;
	} = $props();
</script>

{#if form?.yearError}<p class="mb-2 text-red-700">{form.yearError}</p>{/if}
<div class="divide-y rounded border">
	{#each manualYears as m (m.id)}
		<form method="POST" use:enhance class="flex items-center gap-2 p-2" data-testid="manual-year-row" data-year={m.year}>
			<input type="hidden" name="id" value={m.id} />
			<input type="number" name="year" aria-label="Year" step="1" value={m.year} readonly tabindex="-1" required class="w-24 rounded border bg-gray-100 px-2 py-1 text-gray-500" />
			<input type="number" name="netWorth" aria-label="Net worth" min="0" step="0.01" value={m.netWorth} required class="w-40 rounded border px-2 py-1" />
			<button formaction="?/upsertYear" class="rounded border px-2 py-1 text-sm hover:bg-gray-50">Save</button>
			<button formaction="?/deleteYear" formnovalidate class="rounded border px-2 py-1 text-sm hover:bg-gray-50">Delete</button>
		</form>
	{/each}
</div>
<form method="POST" action="?/upsertYear" use:enhance class="mt-4 flex items-center gap-2" data-testid="add-year">
	<input type="number" name="year" aria-label="Year" placeholder="Year" step="1" required class="w-24 rounded border px-2 py-1" />
	<input type="number" name="netWorth" aria-label="Net worth" placeholder="Net worth" min="0" step="0.01" required class="w-40 rounded border px-2 py-1" />
	<button type="submit" class="rounded border px-3 py-1 text-sm hover:bg-gray-50">Add year</button>
</form>
