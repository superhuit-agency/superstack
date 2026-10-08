---
description: Implement or update Gutenberg block behavior in this headless WordPress + Next.js stack. Use when adding a new block, updating an existing block, changing block data/queries, or modifying block styles across WordPress and Next.js.
compatibility: Superstack — headless WordPress + Next.js monorepo
---

## Goal

Deliver block-related changes with minimal scope, no duplication, and full compatibility between:

- WordPress editor/theme behavior (`wordpress/theme`)
- Next.js rendering behavior (`next/src/components`)

## Required Pre-Checks

1. Confirm exact scope (new block, existing block update, data/query change, style change).
2. Identify affected block slug(s) and all touched files before editing.
3. Reuse existing block patterns and utilities when possible.

## Where to Look

- WordPress side:
  - `wordpress/theme/src`
  - `wordpress/theme/includes`
  - `wordpress/theme/functions.php`
- Next.js side:
  - `next/src/components/core`
  - `next/src/components/global/blockRegistry.ts`
  - `next/src/lib/get-block-final-component-props.ts`
  - `next/src/components/templates`

## Change Rules

1. Keep edits minimal and focused to requested block behavior only.
2. Do not introduce duplicate block registrations or duplicate data mappers.
3. Never remove or rename an existing block registration unless that is the
   explicit request. Registration is what keeps already-published content
   renderable — dropping it breaks live pages, not just new ones. See
   [Removing or renaming a block](../../../docs/blocks/create-block.md#removing-or-renaming-a-block).
4. Preserve existing naming conventions and folder structure.
5. Do not add/remove code comments unless explicitly requested.
6. If a change impacts both WP and Next, update both sides in the same task.

## Block Data Caching Rules

A block's `data.ts` `getData` runs in a cache entry of its own (`next/src/lib/get-cached-block-data.ts`). See `docs/fse-templating.md#caching-block-data`.

1. Return `cacheTags` next to the data, built with `next/src/lib/cache-tags.ts` (e.g. `{ content, cacheTags: [cacheTags.settings()] }`). Without them the block falls back to `content` and `settings` and is refetched after every post or settings change.
2. If `getData` reads the Base URI (`baseUriContext()`), declare `export const usesBaseUri = true;` in the same `data.ts` (or a function of the attributes, when only some read it, like `core/terms-query`'s `termQuery.inherit`). It adds the Base URI to the cache key; without it, one page's data leaks into every other page, and `next build` fails with a `BaseUriNotDeclaredError`.
3. Don't declare `usesBaseUri` on a block that doesn't read the Base URI: it caches one entry per page for nothing, each fetched from WordPress.
4. If `getData` needs the page being viewed (its term or listed post type, the `/page/{n}` page, its `baseUri` or the block's own `innerBlocks`), declare `export const usesArchiveContext = true;` (or a function of the attributes, when only some depend on it, like `core/query`'s `inherit`) and read `getData`'s fourth argument, the `BlockDataContext`. It adds the context to the cache key; other blocks don't get it.
5. Never import `next/cache` in `data.ts`: it's also bundled into the WordPress block editor.
6. `fetchAPI` throws a `WordPressReadError` (`next/src/lib/wordpress-read-error.ts`) when WordPress doesn't answer or returns a GraphQL error. Don't catch it into empty data, or the failure is cached as "nothing there". Keep `null` for "nothing there", and throw a `WordPressReadError` yourself when the queried field is missing (`undefined`). `core/navigation` does this.
7. ESLint enforces 2 and 3 (`superstack/require-uses-base-uri`, `superstack/no-unused-uses-base-uri`): run `cd next && npx eslint <path/to/data.ts>`.

## Safety Rules

1. If change touches deployment/provisioning paths, stop and ask for confirmation.
2. If change requires migration/provisioning behavior, preserve idempotency.
3. Never include secrets or credentials in code/config/docs.

## Verification Checklist

1. `cd next && npx tsc --noEmit`
2. `cd next && npx eslint src/components` reports no `superstack/*` problem.
3. `npm --prefix ./wordpress run build` (theme side) or `npm --prefix ./next run build` (frontend side)
4. Validate block renders in editor and frontend where applicable.
5. Confirm no unrelated files changed.

## Output Format

1. What was changed (files + purpose).
2. Why those changes were needed.
3. What checks were run and results.
4. Any assumptions or follow-up items.
