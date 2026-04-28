# Skill: WordPress Block Change

Use this skill when implementing or updating Gutenberg block behavior in this stack.

## Goal

Deliver block-related changes with minimal scope, no duplication, and full compatibility between:

- WordPress editor/theme behavior (`wordpress/theme`)
- Next.js rendering behavior (`next/src/components`)

## Required Pre-Checks

1. Confirm exact scope with the user (new block, existing block update, data/query change, style change).
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
3. Preserve existing naming conventions and folder structure.
4. Do not add/remove code comments unless explicitly requested.
5. If a change impacts both WP and Next, update both sides in the same task.

## Safety Rules

1. If change touches deployment/provisioning paths, stop and ask for confirmation.
2. If change requires migration/provisioning behavior, preserve idempotency.
3. Never include secrets or credentials in code/config/docs.

## Verification Checklist

1. Type check Next app:
   - `cd next && npx tsc --noEmit`
2. Run relevant build/dev command for modified area:
   - `npm --prefix ./wordpress run build` (theme side) or
   - `npm --prefix ./next run build` (frontend side)
3. Validate block renders in editor and frontend where applicable.
4. Confirm no unrelated files changed.

## Output Format For AI Agent

When finishing the task, report:

1. What was changed (files + purpose).
2. Why those changes were needed.
3. What checks were run and results.
4. Any assumptions or follow-up items.
