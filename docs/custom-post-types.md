# Custom Post Types

How to register a new Custom Post Type (CPT) in this headless WordPress + Next.js stack.

The **Event** CPT is used as the reference example throughout.

---

## 1. WordPress — register the CPT

You can create a new CPT through ACF.

Or, create a PHP file at `wordpress/theme/includes/post-types/your-type.php`.
The following arguments are required for the CPT to work with GraphQL and Next.js:

```php
'show_in_graphql'     => true,
'graphql_single_name' => 'yourType',   // camelCase → becomes the GraphQL type (e.g. "YourType")
'graphql_plural_name' => 'yourTypes',
'public'              => true,
'has_archive'         => true,         // only if the CPT needs an archive page
```

Then load the file in `wordpress/theme/includes/_loader.php`:

```php
require_once __DIR__ . '/post-types/your-type.php';
```

> If the CPT is registered via ACF Pro (UI export), set `show_in_graphql`, `graphql_single_name`, and `graphql_plural_name` in the ACF CPT settings instead. No PHP file is needed.

The `fseTemplate` GraphQL field is automatically added to all CPTs with `show_in_graphql: true` — no extra PHP required.

---

## 2. Next.js — create the template data file

Create `next/src/components/templates/Single[TypeName]/data.ts`:

```ts
import { seoPostTypeFragment } from "@/lib/fragments";
import { gql } from "@/utils";

export const slug = "single-yourtype"; // must equal `single-${__typename.toLowerCase()}`

export const fragment = gql`
  fragment singleYourTypeFragment on YourType {
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

The fragment name (`singleYourTypeFragment`) and the `on YourType` spread must match the GraphQL type name exactly (PascalCase, same as `graphql_single_name` with the first letter capitalised).

---

## 3. Next.js — export the template data

Add the export to `next/src/components/templates/data.ts`:

```ts
export * as singleYourTypeData from "./SingleYourType/data";
```

---

## 4. Next.js — register in `get-node-by-uri.ts`

Two changes in `next/src/lib/get-node-by-uri.ts`:

**Destructure the new export** (around line 11):

```ts
const { singlePageData, singlePostData, singleEventData, singleYourTypeData } =
  templatesData;
```

**Add an entry to the `types` array** (around line 146):

```ts
{
  type: "YourType",
  fragment: singleYourTypeData.fragment,
  fields: "singleYourTypeFragment",
},
```

This array feeds the `nodeByUri` and `nodeById` GraphQL queries used for all page renders.

---

## 5. Next.js — register in `get-preview-node.ts`

Add `'YourType'` to the `POST_TYPES` array in `next/src/lib/get-preview-node.ts`:

```ts
const POST_TYPES = ["Page", "Post", "Event", "YourType"];
```

Without this, the WordPress → Next.js preview redirect resolves to `/undefined`.

---

## Notes

The CPT is rendered via its FSE template + `blocksJSON` — no custom React component is needed. See [fse-templating.md](./fse-templating.md) for how FSE templates work.
