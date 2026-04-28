# Skill: Next-WordPress Data Flow Change

Use this skill for changes to data contracts between WordPress and Next.js.

## Goal

Keep cross-app data flow consistent when changing GraphQL queries, block props, template mappings, or preview/auth-driven fetches.

## Required Pre-Checks

1. Confirm exact data change requested (field addition, shape change, source change, fallback behavior).
2. Identify source and consumers before editing:
   - source query/mapping
   - downstream component usage
3. Confirm whether change affects preview/auth behavior.

## Where to Look

- Data fetching/mapping:
  - `next/src/lib/fetch-api.ts`
  - `next/src/lib/get-node-by-uri.ts`
  - `next/src/lib/get-preview-node.ts`
  - `next/src/lib/get-auth-token.ts`
- Block/data mapping:
  - `next/src/lib/get-block-final-component-props.ts`
  - `next/src/components/global/blockRegistry.ts`
  - `next/src/components/core/**/data.ts`
- WordPress contract sources:
  - `wordpress/theme/**`
  - GraphQL-related plugin/config integration points

## Change Rules

1. Update source and consumer in one task when contract shape changes.
2. Preserve backward-safe fallbacks for optional fields when possible.
3. Keep runtime behavior consistent between preview and non-preview paths.
4. Reuse existing helpers and query patterns.
5. Avoid broad refactors unrelated to the requested data change.

## Safety Rules

1. Do not silently change auth/preview semantics.
2. Confirm before changing cache/revalidation side effects.
3. If JSON fixtures/templates are required, ensure they are tracked and not accidentally ignored.

## Verification Checklist

1. `cd next && npx tsc --noEmit`
2. Verify touched queries/mappers still satisfy consuming components.
3. Confirm preview path still works when relevant.
4. Confirm no unintended changes outside data-flow scope.

## Output Format For AI Agent

1. Data contract change summary (before vs after).
2. Source + consumer files updated.
3. Verification results and any assumptions.
4. Any migration/backward-compat notes.
