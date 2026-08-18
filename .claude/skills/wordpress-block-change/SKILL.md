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

## Safety Rules

1. If change touches deployment/provisioning paths, stop and ask for confirmation.
2. If change requires migration/provisioning behavior, preserve idempotency.
3. Never include secrets or credentials in code/config/docs.

## Verification Checklist

1. `cd next && npx tsc --noEmit`
2. `npm --prefix ./wordpress run build` (theme side) or `npm --prefix ./next run build` (frontend side)
3. Validate block renders in editor and frontend where applicable.
4. Confirm no unrelated files changed.

## Output Format

1. What was changed (files + purpose).
2. Why those changes were needed.
3. What checks were run and results.
4. Any assumptions or follow-up items.
