<script lang="ts">
	import { onMount } from 'svelte';
	import type { Chart as ChartType } from 'chart.js';

	let { rows }: { rows: { name: string; actualValue: number }[] } = $props();
	let canvas: HTMLCanvasElement;

	// Cohesive, theme-aligned categorical palette (evergreen family + warm/cool accents).
	const PALETTE = ['#1b6b4c', '#2f9e6e', '#7bc0a0', '#c9a24b', '#3f6f8f', '#8a6d9e', '#d98a4b', '#9bb07a'];

	onMount(() => {
		let chart: ChartType | undefined;
		let cancelled = false;

		import('chart.js/auto')
			.then(({ default: Chart }) => {
				if (cancelled) return;
				chart = new Chart(canvas, {
					type: 'doughnut',
					data: {
						labels: rows.map((r) => r.name),
						datasets: [
							{
								data: rows.map((r) => r.actualValue),
								backgroundColor: rows.map((_, i) => PALETTE[i % PALETTE.length]),
								borderColor: '#ffffff',
								borderWidth: 2
							}
						]
					},
					options: {
						cutout: '62%',
						plugins: {
							legend: { position: 'bottom', labels: { boxWidth: 12, usePointStyle: true } }
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
