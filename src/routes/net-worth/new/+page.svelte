<script lang="ts">
	import { enhance } from '$app/forms';
	import NetWorthEditor from '$lib/components/NetWorthEditor.svelte';
	let { data, form } = $props();
</script>

<main class="mx-auto max-w-2xl p-6">
	<h1 class="mb-4 text-2xl font-semibold">New net-worth snapshot</h1>
	{#if form?.error}<p class="mb-4 rounded bg-red-100 p-3 text-red-900">{form.error}</p>{/if}
	<form method="POST" action="?/create" use:enhance>
		<NetWorthEditor initialRows={data.rows} takenAt={data.takenAt} categories={data.categories} />
		<button type="submit" class="rounded border px-4 py-2 hover:bg-gray-50">Save snapshot</button>
	</form>
</main>
