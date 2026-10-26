<script lang="ts">
	import { formatUsd } from '$lib/money';
	import MilestonesManager from '$lib/components/MilestonesManager.svelte';
	import YearlyManager from '$lib/components/YearlyManager.svelte';
	import IncomeManager from '$lib/components/IncomeManager.svelte';

	let { data, form } = $props();

	let milestonesDialog: HTMLDialogElement;
	let yearlyDialog: HTMLDialogElement;
	let incomeDialog: HTMLDialogElement;

	const progress = $derived(
		data.fireNumber > 0 ? Math.max(0, Math.min(100, (data.netWorth / data.fireNumber) * 100)) : null
	);
</script>

<main class="mx-auto max-w-5xl px-6 py-8">
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
		<div class="mb-2 flex items-center justify-between">
			<h2 class="font-medium">Milestone ladder</h2>
			<button type="button" onclick={() => milestonesDialog.showModal()} class="rounded border px-3 py-1 text-sm hover:bg-gray-50">Manage milestones</button>
		</div>
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
		<div class="mb-2 flex items-center justify-between">
			<h2 class="font-medium">Yearly review</h2>
			<button type="button" onclick={() => yearlyDialog.showModal()} class="rounded border px-3 py-1 text-sm hover:bg-gray-50">Manage years</button>
		</div>
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
	</section>

	<section class="mb-6">
		<div class="mb-2 flex items-center justify-between">
			<h2 class="font-medium">Income</h2>
			<button type="button" onclick={() => incomeDialog.showModal()} class="rounded border px-3 py-1 text-sm hover:bg-gray-50">Manage income</button>
		</div>
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
	</section>
</main>

<dialog bind:this={milestonesDialog} class="w-full max-w-2xl rounded-lg p-0 backdrop:bg-black/40">
	<div class="p-4">
		<div class="mb-4 flex items-center justify-between">
			<h2 class="text-xl font-semibold">Manage milestones</h2>
			<button type="button" onclick={() => milestonesDialog.close()} class="rounded border px-2 py-1 text-sm hover:bg-gray-50">Close</button>
		</div>
		<MilestonesManager milestones={data.milestones} {form} />
	</div>
</dialog>

<dialog bind:this={yearlyDialog} class="w-full max-w-2xl rounded-lg p-0 backdrop:bg-black/40">
	<div class="p-4">
		<div class="mb-4 flex items-center justify-between">
			<h2 class="text-xl font-semibold">Manage yearly net worth</h2>
			<button type="button" onclick={() => yearlyDialog.close()} class="rounded border px-2 py-1 text-sm hover:bg-gray-50">Close</button>
		</div>
		<YearlyManager manualYears={data.manualYears} {form} />
	</div>
</dialog>

<dialog bind:this={incomeDialog} class="w-full max-w-4xl rounded-lg p-0 backdrop:bg-black/40">
	<div class="p-4">
		<div class="mb-4 flex items-center justify-between">
			<h2 class="text-xl font-semibold">Manage income</h2>
			<button type="button" onclick={() => incomeDialog.close()} class="rounded border px-2 py-1 text-sm hover:bg-gray-50">Close</button>
		</div>
		<IncomeManager incomeYears={data.incomeYears} personIncomes={data.personIncomes} {form} />
	</div>
</dialog>
