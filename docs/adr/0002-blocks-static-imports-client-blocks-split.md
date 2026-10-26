# 2. Blocks are imported statically, Client Components are code-split in a client module

Date: 2026-10-22 · Status: accepted

## Context

`Blocks.tsx` mapped each block slug to `() => import(…)`, expecting each block to be loaded only on the pages that use it. With Turbopack, that is not what happens:

- Every dynamically imported module gets a CSS file of its own, and every page loads all of them as render-blocking stylesheets: 39 files on superstack, 88 on a client project built on it.
- `import()` and `next/dynamic` called from a Server Component do not split the client bundle: every Client Component reachable from the catch-all route ends up in the route's entry chunks, so every page ships the JS of every block.

That client project measured it first (production build, 7 pages, gzip):

|                                    | JS files per page | JS (non-framework) | CSS files | CSS       |
| ---------------------------------- | ----------------- | ------------------ | --------- | --------- |
| `import()` (before)                | 7                 | 122.8 KiB          | 88        | 42.4 KiB  |
| Static imports                     | 6                 | 124.7 KiB          | 4         | 25.1 KiB  |
| `next/dynamic` in Server Component | 7                 | 122.8 KiB          | 88        | 42.4 KiB  |
| This decision                      | 5–10              | 71–116 KiB         | 11–17     | 24–28 KiB |

On superstack (production build, 7 prerendered pages, gzip, all JS including the framework):

|        | JS files | JS            | CSS files | CSS         |
| ------ | -------- | ------------- | --------- | ----------- |
| Before | 12       | 213.3 KiB     | 39        | 10.6 KiB    |
| After  | 12–13    | 212–213.8 KiB | 7–8       | 7.5–7.6 KiB |

The starter has a single non-navigation Client Component block (`core/post-date`), so the JS gain is small here; it grows with each Client Component a project adds. Computed styles are identical before and after on all 7 pages, at 500px and 1440px.

## Decision

- `Blocks.tsx` imports blocks statically.
- Client Components are wrapped in `next/dynamic` in `components/global/ClientBlocks.tsx`, a `'use client'` module, and registered from there. So are the client parts of Server Component blocks: the Server Component imports them from `ClientBlocks.tsx`. Each gets a chunk of its own, loaded only on the pages that render it, and is still server-rendered.
- Navigation blocks (`core/navigation-submenu`, `polylang/language-switcher`…) stay static: they are on every page, so splitting them only adds requests.

## Considered

- Keep `() => import()`: rejected, one render-blocking CSS file per block and no JS splitting.
- Static imports only: rejected, CSS is grouped but every page still ships the JS of every Client Component.
- `next/dynamic` in `Blocks.tsx` (a Server Component): rejected, it behaves like `import()`.
- A test that fails when `Blocks.tsx` statically imports a `'use client'` module: rejected for now, it would miss client parts imported by Server Component blocks; the rule is documented in [create-block.md](../blocks/create-block.md#step-2-register-the-block-in-nextjs) instead.

## Consequences

Adding a Client Component block takes one more line, in `ClientBlocks.tsx`. Forgetting it breaks nothing visible, the block's JS just ships on every page. A Client Component's CSS now loads with its own chunk, so a component that relied on another block's stylesheet must import it itself.
