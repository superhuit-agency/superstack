---
description: Register a new Custom Post Type (CPT) end-to-end in this headless WordPress + Next.js stack. Use when the user asks to add a CPT, a new post type, a new content type, or a new WordPress type.
compatibility: Superstack — headless WordPress + Next.js monorepo
---

A CPT requires changes on both the WordPress side (registration) and the Next.js side (GraphQL fragment, routing, preview). Complete **all applicable steps** — a partial implementation will break routing or preview.

If the CPT has no public single page (admin-only use), skip Steps 2–6. Only Step 1 is needed.

## Required Pre-Checks

1. Confirm the CPT name (e.g. `Event`). Derive:
   - PHP class name: PascalCase → `Event`
   - GraphQL single name: camelCase → `event`
   - GraphQL plural name: camelCase → `events`
   - Template folder: `Single[TypeName]` → `SingleEvent`
   - Fragment name: `single[TypeName]Fragment` → `singleEventFragment`
   - slug: `single-[typename]` → `single-event`
2. Confirm whether the CPT has a public single page. If no, skip Steps 2–6.
3. Confirm whether the CPT needs an archive page (`has_archive`).
4. Confirm the rewrite slug (e.g. `events`). Used for both single entry URLs (`/events/my-event`) and archive URL (`/events`).
5. Confirm whether the CPT needs URI generation at build time (static paths).

## Step 1 — WordPress: register the CPT

Create `wordpress/theme/includes/post-types/[your-type].php`.

Use `post.php` as structural reference (namespace, Singleton trait, `init()` hook). Minimum `register_post_type` args:

```php
'show_in_graphql'     => true,
'graphql_single_name' => 'event',
'graphql_plural_name' => 'events',
'public'              => true,
'has_archive'         => true,        // only if archive needed
'rewrite'             => ['slug' => 'events', 'with_front' => false],
```

Load it in `wordpress/theme/includes/_loader.php` under "Load post types":

```php
require_once __DIR__ . '/post-types/event.php';
```

The `fseTemplate` GraphQL field is registered globally for all CPTs with `show_in_graphql: true` — no extra PHP needed.

## Step 2 — Next.js: create the template data file

Create `next/src/components/templates/Single[TypeName]/data.ts`.

Model on `SinglePage/data.ts` for simple CPTs, or `SinglePost/data.ts` if the CPT needs `getData`.

Minimum required shape:

```ts
import { seoPostTypeFragment } from "@/lib/fragments";
import { gql } from "@/utils";

export const slug = "single-event"; // must equal `single-${__typename.toLowerCase()}`

export const fragment = gql`
  fragment singleEventFragment on Event {
    id: databaseId
    title(format: RENDERED)
    blocksJSON
    uri

    fseTemplate {
      slug
    }

    editLink @include(if: $isPreview)
    preview @include(if: $isPreviewDraft) {
      node {
        blocksJSON
      }
    }
    seo {
      ...seoPostTypeFragment
    }
  }
  ${seoPostTypeFragment}
`;
```

Rules:
- `slug` must equal `single-${__typename.toLowerCase()}` — this is how `get-node-by-uri.ts` routes to the right template.
- Fragment name and `on TypeName` must use the exact PascalCase GraphQL type name.
- Add `getData` only if the CPT needs extra data at render time.

## Step 3 — Next.js: export the template data

Add one line to `next/src/components/templates/data.ts`:

```ts
export * as singleEventData from "./SingleEvent/data";
```

## Step 4 — Next.js: register in `get-node-by-uri.ts`

**4a.** Destructure the new export alongside existing entries (around line 11):

```ts
const { archiveData, singlePageData, singlePostData, singleEventData } =
  templatesData;
```

**4b.** Add an entry to the `types` array (around line 144):

```ts
{
  type: "Event",
  fragment: singleEventData.fragment,
  fields: "singleEventFragment",
},
```

`type` must be the exact PascalCase GraphQL type name.

## Step 5 — Next.js: register in `get-preview-node.ts`

Add the type name to `POST_TYPES` at line 3:

```ts
const POST_TYPES = ["Page", "Post", "Event"];
```

Without this, WordPress → Next.js preview redirect resolves to `/undefined`.

## Step 6 (conditional) — Next.js: register in `get-all-uris.ts`

Only needed if the CPT should generate static paths at build time.

Add the GraphQL plural name to `POST_TYPES` at line 3:

```ts
const POST_TYPES: string[] = ["pages", "events"];
```

Value must match `graphql_plural_name` registered in PHP (lowercase).

## Verification Checklist

1. `cd next && npx tsc --noEmit`
2. `npm --prefix ./next run build`
3. Confirm CPT is visible in WordPress GraphQL schema.
4. Confirm a single CPT entry resolves correctly in Next.js routing.
5. Confirm preview works for a draft entry.
6. Confirm no unrelated files changed.

## Output Format

1. Files created/modified and their purpose.
2. CPT names used (PHP class, GraphQL single/plural, slug, fragment name).
3. Verification results.
4. Any assumptions (e.g. `has_archive` choice, `getData` presence).
