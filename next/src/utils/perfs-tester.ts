type PerfsEntry = { count: number; total: number; max: number };

/**
 * Collects the duration of labelled operations (e.g. WordPress round-trips)
 * and periodically prints a summary table grouped by label.
 *
 * Enabled with `DEBUG_PERFS=1`; every method is a no-op otherwise.
 */
export const PerfsTester = (name = 'perfs', flushDelay = 2000) => {
	const enabled =
		typeof process !== 'undefined' && process.env.DEBUG_PERFS === '1';
	const pending = new Map<number, { label: string; start: number }>();
	const stats = new Map<string, PerfsEntry>();
	let nextId = 0;
	let flushTimer: ReturnType<typeof setTimeout> | null = null;

	const flush = () => {
		flushTimer = null;
		if (stats.size === 0) return;

		const rows = [...stats.entries()]
			.sort(([, a], [, b]) => b.count - a.count)
			.map(([label, { count, total, max }]) => ({
				label,
				count,
				'total (ms)': Math.round(total),
				'avg (ms)': Math.round(total / count),
				'max (ms)': Math.round(max),
			}));
		const count = rows.reduce((sum, row) => sum + row.count, 0);
		const total = rows.reduce((sum, row) => sum + row['total (ms)'], 0);

		console.info(`== [${name}] ${count} calls, ${total}ms cumulated`);
		console.table(rows);
		stats.clear();
	};

	return {
		markStart(label: string) {
			if (!enabled) return -1;

			const id = nextId++;
			pending.set(id, { label, start: performance.now() });
			return id;
		},
		markEnd(id: number) {
			const mark = pending.get(id);
			if (!mark) return;
			pending.delete(id);

			const duration = performance.now() - mark.start;
			const entry = stats.get(mark.label) ?? {
				count: 0,
				total: 0,
				max: 0,
			};
			entry.count++;
			entry.total += duration;
			entry.max = Math.max(entry.max, duration);
			stats.set(mark.label, entry);

			// Print once the burst of calls settles (i.e. a page finished rendering)
			if (flushTimer) clearTimeout(flushTimer);
			flushTimer = setTimeout(flush, flushDelay);
		},
	};
};
