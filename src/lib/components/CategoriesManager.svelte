<script lang="ts">
	import { enhance } from '$app/forms';

	let {
		categories,
		targetsSum,
		form
	}: {
		categories: { id: number; name: string; targetWeight: number; sortOrder: number }[];
		targetsSum: number;
		form: { categoryError?: string } | null;
	} = $props();

	let editingId = $state<number | null>(null);
</script>

{#if form?.categoryError}
	<p class="mb-4 rounded bg-red-100 p-3 text-red-900">{form.categoryError}</p>
{/if}

{#if targetsSum !== 100}
	<p class="mb-4 rounded bg-amber-100 p-3 text-amber-900">
		Targets sum to {targetsSum}% (should be 100%)
	</p>
{/if}

<div class="mb-6 divide-y rounded border">
	{#each categories as category (category.id)}
		<div class="flex items-center gap-2 p-2">
			{#if editingId === category.id}
				<form
					method="POST"
					action="?/updateCategory"
					use:enhance={() => {
						return async ({ update }) => {
							editingId = null;
							await update();
						};
					}}
					class="flex flex-1 items-center gap-2"
				>
					<input type="hidden" name="id" value={category.id} />
					<input type="hidden" name="sortOrder" value={category.sortOrder} />
					<input name="name" value={category.name} class="flex-1 rounded border px-2 py-1" />
					<input
						name="targetWeight"
						type="number"
						step="0.1"
						min="0"
						max="100"
						value={category.targetWeight}
						class="w-20 rounded border px-2 py-1"
					/>
					<span>%</span>
					<button type="submit">Save</button>
					<button type="button" onclick={() => (editingId = null)}>Cancel</button>
				</form>
			{:else}
				<span class="flex-1">{category.name}</span>
				<span class="w-20">{category.targetWeight}%</span>
				<button type="button" onclick={() => (editingId = category.id)}>Edit</button>
			{/if}
			<form method="POST" action="?/deleteCategory" use:enhance>
				<input type="hidden" name="id" value={category.id} />
				<button type="submit">Delete</button>
			</form>
		</div>
	{/each}
</div>

<form method="POST" action="?/createCategory" use:enhance class="flex flex-col gap-3 rounded border p-4">
	<h3 class="font-medium">Add category</h3>
	<div class="flex flex-col gap-1">
		<label for="category-name">Name</label>
		<input id="category-name" name="name" required class="rounded border px-2 py-1" />
	</div>
	<div class="flex flex-col gap-1">
		<label for="category-target">Target %</label>
		<input
			id="category-target"
			name="targetWeight"
			type="number"
			step="0.1"
			min="0"
			max="100"
			required
			class="rounded border px-2 py-1"
		/>
	</div>
	<button type="submit">Add category</button>
</form>
