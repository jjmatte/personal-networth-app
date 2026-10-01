<script lang="ts">
	import HistoryChart from '$lib/components/HistoryChart.svelte';

	let { data } = $props();
</script>

<main class="mx-auto max-w-3xl p-6">
	<h1 class="mb-4 text-2xl font-semibold">History</h1>

	<div class="mb-6 max-w-2xl">
		<HistoryChart series={data.series} />
	</div>
</main>
