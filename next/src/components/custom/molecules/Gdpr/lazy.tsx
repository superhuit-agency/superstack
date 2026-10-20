'use client';

import dynamic from 'next/dynamic';

// A client-side `import()` gives the banner its own chunk, only loaded when
// rendered: imported from a server component, it would join the layout's chunk
export const LazyGdpr = dynamic(() => import('.'));
