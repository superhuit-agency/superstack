'use client';

import dynamic from 'next/dynamic';

// `next/dynamic` only splits code when it is called from a client module: from a
// Server Component, every Client Component reachable from the route ends up in
// the route's entry chunks. Each component below gets its own chunk, which is
// only loaded on pages that render it (SSR is kept).
// See docs/adr/0002-blocks-static-imports-client-blocks-split.md.

// Blocks
export const PostDate = dynamic(() => import('../core/PostDate'));
