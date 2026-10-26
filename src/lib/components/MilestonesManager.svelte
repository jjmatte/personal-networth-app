<script lang="ts">
	import { enhance } from '$app/forms';

	let {
		milestones,
		form
	}: {
		milestones: { id: number; label: string; kind: string; value: number; sortOrder: number }[];
		form: { milestoneError?: string } | null;
	} = $props();
</script>

{#if form?.milestoneError}<p class="mb-2 text-red-700">{form.milestoneError}</p>{/if}
<div class="divide-y rounded border">
	{#each milestones as m (m.id)}
		<form method="POST" use:enhance class="flex items-center gap-2 p-2" data-testid="milestone-row" data-label={m.label}>
			<input type="hidden" name="id" value={m.id} />
			<input name="label" aria-label="Label" value={m.label} required class="flex-1 rounded border px-2 py-1" />
			<select name="kind" aria-label="Kind" class="rounded border px-2 py-1">
				<option value="fixed" selected={m.kind === 'fixed'}>Fixed $</option>
				<option value="percent" selected={m.kind === 'percent'}>% of FIRE</option>
			</select>
			<input type="number" name="value" aria-label="Value" step="any" value={m.value} required class="w-28 rounded border px-2 py-1" />
			<input type="number" name="sortOrder" aria-label="Order" min="0" step="1" value={m.sortOrder} class="w-16 rounded border px-2 py-1" />
			<button formaction="?/updateMilestone" class="rounded border px-2 py-1 text-sm hover:bg-gray-50">Save</button>
			<button formaction="?/deleteMilestone" formnovalidate class="rounded border px-2 py-1 text-sm hover:bg-gray-50">Delete</button>
		</form>
	{/each}
</div>

<form method="POST" action="?/createMilestone" use:enhance class="mt-4 flex items-center gap-2" data-testid="add-milestone">
	<input name="label" aria-label="Label" placeholder="Label" required class="flex-1 rounded border px-2 py-1" />
	<select name="kind" aria-label="Kind" class="rounded border px-2 py-1">
		<option value="fixed">Fixed $</option>
		<option value="percent">% of FIRE</option>
	</select>
	<input type="number" name="value" aria-label="Value" placeholder="Value" step="any" required class="w-28 rounded border px-2 py-1" />
	<button type="submit" class="rounded border px-3 py-1 text-sm hover:bg-gray-50">Add milestone</button>
</form>
