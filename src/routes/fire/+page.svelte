<script lang="ts">
	import { enhance } from '$app/forms';
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

	<section class="mb-6">
		<h2 class="mb-2 font-medium">Yearly review</h2>
		<table class="w-full rounded border text-left">
			<thead>
				<tr class="border-b">
					<th class="p-2">Year</th>
					<th class="p-2">Net Worth</th>
					<th class="p-2">Gain</th>
					<th class="p-2">Monthly</th>
				</tr>
			</thead>
			<tbody>
				{#each data.yearly as r (r.year)}
					<tr class="border-b" data-testid="yearly-row" data-year={r.year}>
						<td class="p-2">
							{r.year}
							{#if r.source === 'snapshot'}<span class="text-xs text-gray-500">from snapshots</span>{/if}
						</td>
						<td class="p-2">{formatUsd(r.netWorth)}</td>
						<td class="p-2">
							{#if r.gain === null}
								<span class="text-gray-500">-</span>
							{:else}
								<span data-testid="yearly-gain" class={r.gain >= 0 ? 'text-green-700' : 'text-red-700'}>{r.gain >= 0 ? '+' : ''}{formatUsd(r.gain)}</span>
							{/if}
						</td>
						<td class="p-2">
							{#if r.monthly === null}
								<span class="text-gray-500">-</span>
							{:else}
								<span data-testid="yearly-monthly" class={r.monthly >= 0 ? 'text-green-700' : 'text-red-700'}>{r.monthly >= 0 ? '+' : ''}{formatUsd(r.monthly)}</span>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>

		<h3 class="mt-4 mb-2 font-medium">Edit manual years</h3>
		{#if form?.yearError}<p class="mb-2 text-red-700">{form.yearError}</p>{/if}
		<div class="divide-y rounded border">
			{#each data.manualYears as m (m.id)}
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
	</section>

	<section class="mb-6">
		<h2 class="mb-2 font-medium">Income</h2>
		<table class="w-full rounded border text-left">
			<thead>
				<tr class="border-b">
					<th class="p-2">Year</th>
					<th class="p-2">Estimated</th>
					<th class="p-2">Actual</th>
					<th class="p-2">By person</th>
					<th class="p-2">Investment</th>
					<th class="p-2">Net Monthly Margin</th>
				</tr>
			</thead>
			<tbody>
				{#each data.income as r (r.year)}
					<tr class="border-b" data-testid="income-row" data-year={r.year}>
						<td class="p-2">{r.year}</td>
						<td class="p-2" data-testid="income-estimated">
							{formatUsd(r.estimatedIncome)}
							<span class="block text-xs text-gray-500">{formatUsd(r.estimatedMonthly)}/mo</span>
						</td>
						<td class="p-2" data-testid="income-actual">
							{formatUsd(r.actualIncome)}
							<span class="block text-xs text-gray-500">{formatUsd(r.actualMonthly)}/mo</span>
						</td>
						<td class="p-2">
							{#each r.persons as p, i (i)}
								<span class="block text-sm">{p.name}: {formatUsd(p.amount)}</span>
							{/each}
						</td>
						<td class="p-2" data-testid="income-investment">
							{formatUsd(r.investmentIncome)}
							<span class="block text-xs text-gray-500">{formatUsd(r.investmentMonthly)}/mo</span>
						</td>
						<td class="p-2" data-testid="income-margin">{formatUsd(r.netMonthlyMargin)}</td>
					</tr>
				{/each}
			</tbody>
		</table>

		{#if form?.incomeError}<p class="mt-2 text-red-700">{form.incomeError}</p>{/if}

		<h3 class="mt-4 mb-2 font-medium">Edit income years</h3>
		<div class="divide-y rounded border">
			{#each data.incomeYears as m (m.id)}
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

		<h3 class="mt-4 mb-2 font-medium">Edit person income</h3>
		<div class="divide-y rounded border">
			{#each data.personIncomes as m (m.id)}
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
