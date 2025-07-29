'use client';

import { useMemo } from 'react';

export const useIsEditor = () => {
	// Check if we're in WordPress editor
	const isEditor = useMemo(
		() => !!(typeof window !== 'undefined' && window.wp),
		[]
	);

	return isEditor;
};
