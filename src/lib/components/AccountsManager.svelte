<script lang="ts">
	import { enhance } from '$app/forms';

	let {
		accounts,
		form
	}: {
		accounts: { id: number; name: string; type: string; accessible: boolean; sortOrder: number }[];
		form: { accountError?: string } | null;
	} = $props();

	const types = [
		['taxable', 'Taxable'],
		['roth_ira', 'Roth IRA'],
		['traditional_ira', 'Traditional IRA'],
		['hsa', 'HSA'],
		['401k', '401(k)'],
		['other', 'Other']
	];
	const typeLabel = (t: string) => types.find(([v]) => v === t)?.[1] ?? t;

	let editingId = $state<number | null>(null);
</script>

{#if form?.accountError}
	<p class="mb-4 rounded bg-red-100 p-3 text-red-900">{form.accountError}</p>
{/if}

<div class="mb-6 divide-y rounded border">
	{#each accounts as account (account.id)}
		<div class="flex items-center gap-2 p-2">
			{#if editingId === account.id}
				<form
					method="POST"
					action="?/updateAccount"
					use:enhance={() => {
						return async ({ update }) => {
							editingId = null;
							await update();
						};
					}}
					class="flex flex-1 items-center gap-2"
				>
					<input type="hidden" name="id" value={account.id} />
					<input type="hidden" name="sortOrder" value={account.sortOrder} />
					<input name="name" value={account.name} class="flex-1 rounded border px-2 py-1" />
					<select name="type" aria-label="Type" class="rounded border px-2 py-1">
						{#each types as [value, label] (value)}
							<option {value} selected={value === account.type}>{label}</option>
						{/each}
					</select>
					<label class="flex items-center gap-1">
						<input name="accessible" type="checkbox" checked={account.accessible} />
						Accessible
					</label>
					<button type="submit">Save</button>
					<button type="button" onclick={() => (editingId = null)}>Cancel</button>
				</form>
			{:else}
				<span class="flex-1">{account.name}</span>
				<span class="w-32">{typeLabel(account.type)}</span>
				<span class="w-24">{account.accessible ? 'Accessible' : 'Locked'}</span>
				<button type="button" onclick={() => (editingId = account.id)}>Edit</button>
			{/if}
			<form method="POST" action="?/deleteAccount" use:enhance>
				<input type="hidden" name="id" value={account.id} />
				<button type="submit">Delete</button>
			</form>
		</div>
	{/each}
</div>

<form method="POST" action="?/createAccount" use:enhance class="flex flex-col gap-3 rounded border p-4">
	<h3 class="font-medium">Add account</h3>
	<div class="flex flex-col gap-1">
		<label for="account-name">Name</label>
		<input id="account-name" name="name" required class="rounded border px-2 py-1" />
	</div>
	<div class="flex flex-col gap-1">
		<label for="account-type">Type</label>
		<select id="account-type" name="type" class="rounded border px-2 py-1">
			{#each types as [value, label] (value)}
				<option {value}>{label}</option>
			{/each}
		</select>
	</div>
	<label class="flex items-center gap-2">
		<input name="accessible" type="checkbox" />
		Accessible
	</label>
	<button type="submit">Add account</button>
</form>
