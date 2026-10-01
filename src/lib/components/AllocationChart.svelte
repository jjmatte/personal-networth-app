<script lang="ts">
	import { onMount } from 'svelte';
	import type { Chart as ChartType } from 'chart.js';

	let { rows }: { rows: { name: string; actualValue: number }[] } = $props();
	let canvas: HTMLCanvasElement;

	onMount(() => {
		let chart: ChartType | undefined;
		let cancelled = false;

		import('chart.js/auto').then(({ default: Chart }) => {
			if (cancelled) return;
			chart = new Chart(canvas, {
				type: 'doughnut',
				data: {
					labels: rows.map((r) => r.name),
					datasets: [{ data: rows.map((r) => r.actualValue) }]
				}
			});
		});

		return () => {
			cancelled = true;
			chart?.destroy();
		};
	});
</script>

<canvas bind:this={canvas}></canvas>
