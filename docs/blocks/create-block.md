# Create a new block

Superstack supports two ways to add content blocks:

1. **Pattern blocks** — compose existing core blocks with CSS classes, save as a pattern. Fastest for layout sections.
2. **Custom Gutenberg blocks** — register a new block slug with custom attributes and a dedicated editor UI. Best when you need structured data, a fixed visual, or constrained editing.

---

## Option A — Pattern block (core blocks + CSS)

Use this when a section can be built from core blocks (`core/group`, `core/heading`, `core/paragraph`, etc.) with project CSS classes.

### Step 1: Create the block in the WordPress editor

- Build the layout with core blocks.
- Add utility / BEM classes in the block's **Additional CSS class(es)** field.

### Step 2: Copy markup to the patterns folder

- Open the WordPress code editor and copy the block markup.
- Paste it into a new file under [`wordpress/theme/patterns/`](../../wordpress/theme/patterns/).
- Add the pattern header

```
<?php

/**
 * Title: En-tête - Page d'accueil
 * Slug: superstack/hero-homepage
 * Categories: header
 * Description: Afficher un en-tête avec du texte pour la page d'accueil.
 *
 * @package    Superstack
 * @subpackage Superstack/patterns
 * @since      1.0.0
 */

?>
```

### Step 3: Add frontend styles

- Add matching styles in `next/src/css/patterns/_<name>.css` and import it from `next/src/css/patterns/index.css`. The folder does not exist in the starter — on the first pattern, create it and add `@import '../patterns/index.css';` to [`next/src/css/base/index.css`](../../next/src/css/base/index.css).
- Optionally add editor preview styles under [`wordpress/theme/src/shared/`](../../wordpress/theme/src/shared/).

### Step 4: Clear the patterns cache (if needed)

```bash
npm --prefix ./wordpress run clear-cache
```

---

## Option B — Custom Gutenberg block

Use this when you need a dedicated block in the inserter

Custom blocks are **dynamic** in this stack: the WordPress editor stores attributes in block JSON, and Next.js handles all frontend rendering.

### Architecture

```
WordPress theme (editor)                   Next.js (frontend)
────────────────────────────────           ──────────────────
src/blocks/custom/<level>/<Name>/register.ts
src/blocks/custom/<level>/<Name>/edit.tsx
src/blocks/index.ts   ← barrel
                                           components/custom/<level>/<Name>/index.tsx
                                           components/custom/<level>/<Name>/block.json  ← slug source of truth
                                           global/Blocks.tsx                            ← slug → component map
```

`<level>` is `atoms`, `molecules` or `organisms`. The WordPress folder mirrors the Next.js one so each block's editor and frontend code are easy to pair up.

Data flow: Gutenberg saves `<!-- wp:namespace/block {"attr":"…"} /-->` → WPGraphQL `blocksJSON` → Next.js `<Blocks />`.

### Step 1: Create the Next.js component

Under `next/src/components/custom/<level>/<Name>/`, create a folder with:

| File           | Purpose                                    |
| -------------- | ------------------------------------------ |
| `block.json`   | Block slug and title (source of truth)     |
| `typings.d.ts` | Attribute and props interfaces             |
| `index.tsx`    | Default export — frontend render component |
| `styles.css`   | Frontend styles (optional)                 |

**`block.json`** example (the examples below use a hypothetical `superstack/tag` block in `custom/atoms/Tag/`):

```json
{
  "slug": "superstack/tag",
  "title": "Tag"
}
```

Core blocks follow the same convention — see [`core/Heading/block.json`](../../next/src/components/core/Heading/block.json).

### Step 2: Register the block in Next.js

Add the slug to `blocksList` in [`next/src/components/global/Blocks.tsx`](../../next/src/components/global/Blocks.tsx):

```ts
'superstack/tag': () => import('../custom/atoms/Tag'),
```

Without this entry, the block saves in WordPress but Next.js will log a dev warning and render nothing.

### Step 3: Register the block in the WordPress editor

Create files under `wordpress/theme/src/blocks/custom/<level>/<Name>/` (the `blocks/` folder does not exist in the starter — the first block creates it):

| File              | Purpose                                                         |
| ----------------- | --------------------------------------------------------------- |
| `register.ts`     | Calls `registerBlockType` (use `.tsx` if `save` returns JSX)    |
| `edit.tsx`        | Gutenberg edit UI                                               |
| `styles.edit.css` | Editor-only preview styles (optional)                           |

**`register.ts`** — import `block.json` from Next via the `@/` webpack alias (`@` → `next/src`):

```ts
import { registerBlockType } from '@wordpress/blocks';

import block from '@/components/custom/atoms/Tag/block.json';

import Edit from './edit';

registerBlockType(block.slug, {
  title: block.title,
  category: 'superstack',
  icon: 'tag',
  attributes: {
    label: { type: 'string', default: '' },
  },
  supports: { anchor: false, multiple: true },
  edit: Edit,
  save: () => null,
});
```

`category: 'superstack'` is registered in [`register-block-categories.php`](../../wordpress/theme/includes/admin/editor/register-block-categories.php). Keep `save: () => null` for attribute-only blocks; blocks with inner blocks return `<InnerBlocks.Content />` instead.

**`edit.tsx`** — build the Gutenberg UI with `@wordpress/block-editor` components (`RichText`, `useBlockProps`, `InnerBlocks`, etc.). Import the frontend styles from Next (`import '@/components/custom/atoms/Tag/styles.css';`) so the editor preview matches the site.

### Step 4: Wire the block into the editor bundle

Add an import to the barrel `wordpress/theme/src/blocks/index.ts` (create it with the first block):

```ts
import './custom/atoms/Tag/register';
```

When creating the barrel, load it from [`wordpress/theme/src/editor/index.ts`](../../wordpress/theme/src/editor/index.ts), next to the filters import:

```ts
import '../blocks';
```

### Step 5: Build theme assets

```bash
npm --prefix ./wordpress run build
# or during development:
npm --prefix ./wordpress run dev
```

### Step 6: Sync the GraphQL block registry

`wp-graphql-gutenberg` stores block schemas in the `wp_graphql_gutenberg_block_types` option. Core blocks are seeded on provision; **custom blocks must be synced manually** after registration:

1. Open **WP Admin → GraphQL → Gutenberg**
2. Click **Update block registry**

Without this step, the block may save in WordPress but `blocksJSON` may not expose your attributes to Next.js.

### Step 7: Verify

**WordPress editor**

- Insert the block (category: **Superstack**).
- Edit content, save the page.
- Post content should contain: `<!-- wp:superstack/tag {"label":"…"} /-->`

**Next.js frontend**

- Load the page on the Next dev server.
- Confirm the component renders with the expected attributes.
- No dev warning: `The following block does not exist: superstack/tag`.

**Type check** (optional):

```bash
cd next && npx tsc --noEmit
```

---

## Extending core blocks (filters)

To tweak an existing core block (e.g. limit heading levels, restrict post types), add an `edit.tsx` filter under `next/src/components/core/<Block>/` and export it from [`next/src/components/filters.ts`](../../next/src/components/filters.ts). This is different from registering a new custom block — see [`core/Image/edit.tsx`](../../next/src/components/core/Image/edit.tsx) for an example.

## Removing or renaming a block

Registration is not just wiring for new content — it is what keeps **already-published** content renderable. Removing a block's registration, or renaming its slug, breaks every page that already uses it:

- **Drop the slug from `blocksList`** in [`next/src/components/global/Blocks.tsx`](../../next/src/components/global/Blocks.tsx) and the frontend silently renders nothing for that block. Only in development does it log `The following block does not exist: <slug>`; in production the block just disappears.
- **Drop the WordPress-side registration** and Gutenberg no longer recognises the block, so the editor shows it as unsupported ("Your site doesn't include support for the … block").
- **Add a core block to `excludedBlocks`** in [`wordpress/theme/src/editor/index.ts`](../../wordpress/theme/src/editor/index.ts) and it is unregistered from the editor — existing content using it is affected the same way.

Because the slug is the link between saved content and code, a rename is a removal plus an addition — old content still references the old slug. Changing a block's `save()` output without a deprecation has a related effect: existing content no longer matches, and Gutenberg flags it as invalid content.

So:

- Never remove or rename a registered block as a side effect of another change. Treat it as a deliberate decision that needs a content migration, not a cleanup.
- Adding a block is safe; removing one is not.
- If a block really must go, migrate or remove the content that uses it first.

This applies to humans and coding agents alike.

## Checklist — custom block

| Step                                           | Location                                            |
| ---------------------------------------------- | --------------------------------------------------- |
| 1. `block.json` + `index.tsx` + `typings.d.ts` | `next/src/components/custom/<level>/<Name>/`        |
| 2. Register slug                               | `next/src/components/global/Blocks.tsx`             |
| 3. `register.ts` + `edit.tsx`                  | `wordpress/theme/src/blocks/custom/<level>/<Name>/` |
| 4. Barrel import                               | `wordpress/theme/src/blocks/index.ts`               |
| 5. Build theme assets                          | `npm --prefix ./wordpress run build`                |
| 6. Sync GraphQL registry                       | WP Admin → GraphQL → Gutenberg                      |
| 7. Verify editor + frontend                    | —                                                   |

## Parent / child blocks (optional)

For blocks that belong inside a wrapper (e.g. a list item inside a `<ul>`), register both blocks and set `parent` / `allowedBlocks` on the child once the parent exists. For example, a `superstack/tag-list` parent would list `superstack/tag` in its `allowedBlocks`, and the tag would set `parent: ['superstack/tag-list']`.
