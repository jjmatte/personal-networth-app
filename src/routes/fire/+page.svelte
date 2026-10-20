<script lang="ts">
	import { formatUsd } from '$lib/money';

	let { data, form } = $props();

	const progress = $derived(
		data.fireNumber > 0 ? Math.max(0, Math.min(100, (data.netWorth / data.fireNumber) * 100)) : null
	);
</script>

<main class="mx-auto max-w-3xl p-6">
	<h1 class="mb-4 text-2xl font-semibold">FIRE</h1>

	<section class="mb-6 rounded border p-4">
		<h2 class="mb-2 font-medium">Monthly spend</h2>
		<form method="POST" action="?/setSpend" class="flex items-center gap-2">
			<span aria-hidden="true">$</span>
			<input
				type="number"
				name="monthlySpend"
				min="0"
				step="1"
				required
				aria-label="Monthly spend"
				value={data.monthlySpend}
				class="w-32 rounded border px-2 py-1"
			/>
			<button type="submit" class="rounded border px-3 py-1 text-sm hover:bg-gray-50">Save spend</button>
		</form>
		{#if form?.spendError}<p class="mt-2 text-red-700">{form.spendError}</p>{/if}
		<p class="mt-2" data-testid="fire-number">FIRE number: {formatUsd(data.fireNumber)}</p>
		<p class="text-sm text-gray-500">Monthly spend x 12 x 25.</p>
	</section>

	<section class="mb-6 rounded border p-4">
		<h2 class="mb-2 font-medium">Net worth</h2>
		<p data-testid="net-worth">
			{formatUsd(data.netWorth)}{#if !data.hasSnapshot} (no snapshot yet){/if}
		</p>
		{#if progress !== null}
			<p class="text-sm text-gray-500">{progress.toFixed(1)}% of your FIRE number</p>
		{:else}
			<p class="text-sm text-gray-500">Set your monthly spend to see overall progress.</p>
		{/if}
		<h3 class="mt-4 font-medium">Accessible vs locked (investments)</h3>
		<p data-testid="accessible">Accessible: {formatUsd(data.split.accessible)}</p>
		<p data-testid="locked">Locked: {formatUsd(data.split.locked)}</p>
	</section>

	<section class="mb-6">
		<h2 class="mb-2 font-medium">Milestone ladder</h2>
		<ul class="divide-y rounded border">
			{#each data.rungs as rung, i (i)}
				<li class="flex items-center gap-4 p-2" data-testid="rung">
					<span class="flex-1">{rung.label}</span>
					{#if rung.pending}
						<span class="text-gray-500">Pending: set your monthly spend</span>
					{:else}
						<span class="w-32">{formatUsd(rung.target)}</span>
						{#if rung.complete}
							<span class="w-32 text-green-700">Complete</span>
						{:else}
							<span class="w-32">{formatUsd(rung.amountToNext)} to go</span>
						{/if}
					{/if}
				</li>
			{/each}
		</ul>
	</section>

	<section>
		<h2 class="mb-2 font-medium">Edit milestones</h2>
		{#if form?.milestoneError}<p class="mb-2 text-red-700">{form.milestoneError}</p>{/if}
		<div class="divide-y rounded border">
			{#each data.milestones as m (m.id)}
				<form method="POST" class="flex items-center gap-2 p-2" data-testid="milestone-row" data-label={m.label}>
					<input type="hidden" name="id" value={m.id} />
					<input name="label" aria-label="Label" value={m.label} required class="flex-1 rounded border px-2 py-1" />
					<select name="kind" aria-label="Kind" class="rounded border px-2 py-1">
						<option value="fixed" selected={m.kind === 'fixed'}>Fixed $</option>
						<option value="percent" selected={m.kind === 'percent'}>% of FIRE</option>
					</select>
					<input
						type="number"
						name="value"
						aria-label="Value"
						step="any"
						value={m.value}
						required
						class="w-28 rounded border px-2 py-1"
					/>
					<input
						type="number"
						name="sortOrder"
						aria-label="Order"
						min="0"
						step="1"
						value={m.sortOrder}
						class="w-16 rounded border px-2 py-1"
					/>
					<button formaction="?/updateMilestone" class="rounded border px-2 py-1 text-sm hover:bg-gray-50">Save</button>
					<button formaction="?/deleteMilestone" formnovalidate class="rounded border px-2 py-1 text-sm hover:bg-gray-50">Delete</button>
				</form>
			{/each}
		</div>

		<form
			method="POST"
			action="?/createMilestone"
			class="mt-4 flex items-center gap-2"
			data-testid="add-milestone"
		>
			<input name="label" aria-label="Label" placeholder="Label" required class="flex-1 rounded border px-2 py-1" />
			<select name="kind" aria-label="Kind" class="rounded border px-2 py-1">
				<option value="fixed">Fixed $</option>
				<option value="percent">% of FIRE</option>
			</select>
			<input
				type="number"
				name="value"
				aria-label="Value"
				placeholder="Value"
				step="any"
				required
				class="w-28 rounded border px-2 py-1"
			/>
			<button type="submit" class="rounded border px-3 py-1 text-sm hover:bg-gray-50">Add milestone</button>
		</form>
	</section>
</main>
