(function () {
	'use strict';

	var data = window.cookieAnalyticsData;

	if (!data || !data.labels || data.labels.length === 0) {
		return;
	}

	var canvas = document.getElementById('cookieAnalyticsChart');
	if (!canvas) return;

	new Chart(canvas, {
		type: 'line',
		data: {
			labels: data.labels,
			datasets: [
				{
					label: 'Impressions',
					data: data.impressions,
					borderColor: '#3b82f6',
					backgroundColor: 'rgba(59, 130, 246, 0.1)',
					borderWidth: 2,
					tension: 0.3,
					fill: true,
				},
				{
					label: 'Accepts',
					data: data.accepts,
					borderColor: '#22c55e',
					backgroundColor: 'rgba(34, 197, 94, 0.1)',
					borderWidth: 2,
					tension: 0.3,
					fill: true,
				},
				{
					label: 'Rejects',
					data: data.rejects,
					borderColor: '#ef4444',
					backgroundColor: 'rgba(239, 68, 68, 0.1)',
					borderWidth: 2,
					tension: 0.3,
					fill: true,
				},
				{
					label: 'Personalize',
					data: data.personalizes,
					borderColor: '#f59e0b',
					backgroundColor: 'rgba(245, 158, 11, 0.1)',
					borderWidth: 2,
					tension: 0.3,
					fill: true,
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: true,
			interaction: {
				mode: 'index',
				intersect: false,
			},
			plugins: {
				legend: {
					position: 'bottom',
					labels: {
						usePointStyle: true,
						pointStyle: 'circle',
						padding: 20,
					},
				},
				tooltip: {
					backgroundColor: 'rgba(0, 0, 0, 0.8)',
					cornerRadius: 6,
					padding: 12,
				},
			},
			scales: {
				y: {
					beginAtZero: true,
					ticks: {
						precision: 0,
					},
					grid: {
						color: 'rgba(0, 0, 0, 0.06)',
					},
				},
				x: {
					grid: {
						display: false,
					},
				},
			},
		},
	});
})();
