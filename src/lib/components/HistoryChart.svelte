<script lang="ts">
	import { onMount } from 'svelte';
	import type { Chart as ChartType } from 'chart.js';

	let {
		series
	}: { series: { symbol: string; points: { t: string | Date; value: number }[] }[] } = $props();
	let canvas: HTMLCanvasElement;

	const PALETTE = ['#1b6b4c', '#2f9e6e', '#c9a24b', '#3f6f8f', '#8a6d9e', '#d98a4b', '#7bc0a0', '#9bb07a'];

	onMount(() => {
		let chart: ChartType | undefined;
		let cancelled = false;

		Promise.all([import('chart.js/auto'), import('chartjs-adapter-date-fns')])
			.then(([{ default: Chart }]) => {
				if (cancelled) return;
				chart = new Chart(canvas, {
					type: 'line',
					data: {
						datasets: series.map((s, i) => ({
							label: s.symbol,
							data: s.points.map((p) => ({ x: new Date(p.t).getTime(), y: p.value })),
							borderColor: PALETTE[i % PALETTE.length],
							backgroundColor: PALETTE[i % PALETTE.length],
							tension: 0.3,
							pointRadius: 2,
							borderWidth: 2
						}))
					},
					options: {
						plugins: {
							legend: { position: 'bottom', labels: { boxWidth: 12, usePointStyle: true } }
						},
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
