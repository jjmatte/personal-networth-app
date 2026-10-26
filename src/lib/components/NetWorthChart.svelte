<script lang="ts">
	import { onMount } from 'svelte';
	import type { Chart as ChartType } from 'chart.js';
	import { formatUsd } from '$lib/money';

	let { points }: { points: { t: string | Date; value: number }[] } = $props();
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
						datasets: [
							{
								label: 'Net worth',
								data: points.map((p) => ({ x: new Date(p.t).getTime(), y: p.value })),
								borderColor: '#1b6b4c',
								backgroundColor: 'rgba(27, 107, 76, 0.12)',
								fill: true,
								tension: 0.3,
								pointRadius: 2,
								borderWidth: 2
							}
						]
					},
					options: {
						maintainAspectRatio: false,
						plugins: {
							legend: { display: false },
							tooltip: {
								callbacks: {
									label: (ctx) => formatUsd(ctx.parsed.y ?? 0)
								}
							}
						},
						scales: {
							x: { type: 'time', time: { tooltipFormat: 'PP' } },
							y: {
								ticks: {
									callback: (value) => formatUsd(Number(value))
								}
							}
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

<canvas bind:this={canvas} aria-label="Net worth over time">Net worth over time chart</canvas>
