# 1. A block whose data fails fails the public render

Date: 2026-10-20 · Status: accepted · Issue: #212

## Context

Pages are cached with `cacheLife('max')` and refreshed only by tag. The block pipeline used to swallow any error that wasn't a WordPress read failure: the block rendered on its editor attributes, or a template block disappeared, and that broken page was cached until one of its tags changed. A bug in one block's `getData` could stay on the public site indefinitely, unnoticed.

## Decision

Outside preview, any error thrown while preparing a block's data fails the page render, whatever its kind. A page cached before keeps serving its previous version; a page never cached shows the error page; `next build` fails. In preview, every such error falls back to the block's editor attributes, so editors keep a usable page. Template blocks follow the same rule. A `getData` returns empty data when there is nothing to show and throws only for a failure.

## Considered

- Keep the silent fallback (cached forever): rejected, it hides bugs permanently.
- Fall back but cache with a finite lifetime: rejected, it needs fallback detection inside the cache scope and still serves broken pages for that lifetime.
- Treat template blocks differently: rejected, a page without its header is worse than the previous version of the page.

## Consequences

One block's bug can fail a whole page, which is loud by design: a page cached before keeps its last good version, and a never-cached page shows the error page until the bug is fixed. Errors no longer need sorting by `digest` in the block pipeline.
