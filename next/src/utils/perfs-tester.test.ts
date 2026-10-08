import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PerfsTester } from './perfs-tester';

describe('PerfsTester', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.spyOn(console, 'info').mockImplementation(() => {});
		vi.spyOn(console, 'table').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.unstubAllEnvs();
		vi.restoreAllMocks();
	});

	it('does nothing without DEBUG_PERFS', () => {
		vi.stubEnv('DEBUG_PERFS', '');
		const tester = PerfsTester('test');

		expect(tester.markStart('query - A')).toBe(-1);
		tester.markEnd(-1);
		vi.runAllTimers();

		expect(console.info).not.toHaveBeenCalled();
		expect(console.table).not.toHaveBeenCalled();
	});

	it('prints one summary per label once the calls settle', () => {
		vi.stubEnv('DEBUG_PERFS', '1');
		const tester = PerfsTester('test', 100);

		tester.markEnd(tester.markStart('query - A'));
		tester.markEnd(tester.markStart('query - A'));
		tester.markEnd(tester.markStart('query - B'));

		vi.advanceTimersByTime(99);
		expect(console.table).not.toHaveBeenCalled();

		vi.advanceTimersByTime(1);
		expect(console.info).toHaveBeenCalledWith(
			expect.stringMatching(/^== \[test\] 3 calls/)
		);
		expect(console.table).toHaveBeenCalledWith([
			expect.objectContaining({ label: 'query - A', count: 2 }),
			expect.objectContaining({ label: 'query - B', count: 1 }),
		]);
	});
});
