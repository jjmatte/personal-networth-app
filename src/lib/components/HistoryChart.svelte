<script lang="ts">
	import { onMount } from 'svelte';
	import type { Chart as ChartType } from 'chart.js';

	let {
		series
	}: { series: { symbol: string; points: { t: string | Date; value: number }[] }[] } = $props();
	let canvas: HTMLCanvasElement;

	onMount(() => {
		let chart: ChartType | undefined;
		let cancelled = false;

		Promise.all([import('chart.js/auto'), import('chartjs-adapter-date-fns')])
			.then(([{ default: Chart }]) => {
				if (cancelled) return;
				chart = new Chart(canvas, {
					type: 'line',
					data: {
						datasets: series.map((s) => ({
							label: s.symbol,
							data: s.points.map((p) => ({ x: new Date(p.t).getTime(), y: p.value }))
						}))
					},
					options: {
						scales: {
							x: { type: 'time', time: { tooltipFormat: 'PP' } }
						}
					}
				});
			})
			.catch(() => {});

		return () => {
			cancelled = true;
			chart?.destroy();
		};
	});
</script>

<canvas bind:this={canvas}></canvas>
