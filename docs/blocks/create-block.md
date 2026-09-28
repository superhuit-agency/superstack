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

- Add matching styles under [`next/src/css/patterns/`](../../next/src/css/patterns/).
- Optionally add editor preview styles under [`wordpress/theme/src/shared/`](../../wordpress/theme/src/shared/).

### Step 4: Clear the patterns cache (if needed)

```bash
npm --prefix ./wordpress run clear-cache
```

---

## Option B — Custom Gutenberg block

Use this when you need a dedicated block in the inserter

Custom blocks are **dynamic** in this stack: the WordPress editor stores attributes in block JSON, and Next.js handles all frontend rendering.

### Rule: prefer core blocks as inner blocks

**Always favour native WordPress blocks as inner blocks over custom attributes.** A custom attribute (`RichText`, `MediaUpload`, …) should be the exception, not the default.

Before adding an attribute, ask: is there a core block that already does this?

| Content            | Do this                      | Not this                     |
| ------------------ | ---------------------------- | ---------------------------- |
| Title              | `core/heading` inner block   | `RichText` on a `title` attr |
| Text / description | `core/paragraph` inner block | `RichText` on a `text` attr  |
| Image              | `core/image` inner block     | `MediaUpload` + `image` attr |
| Button / link      | `core/buttons` inner block   | custom `url` + `label` attrs |
| List               | `core/list` inner block      | repeater attribute           |

Why: editors keep the native toolbars, typography, colors and block styles; the markup stays standard; Next.js already renders every core block via `<Blocks />`, so there is nothing extra to build on the frontend.

Keep attributes only for structured data that has no core equivalent (a layout variant, an icon name, a post-type filter, a boolean toggle…).

**Locking the structure with a template**

Declare the expected inner blocks with `InnerBlocks` `template` + `templateLock`, so the block always ships with the right children:

```tsx
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

const TEMPLATE: any[] = [
	['core/heading', { level: 3, placeholder: 'Titre' }],
	['core/paragraph', { placeholder: 'Description' }],
];

export default function Edit() {
	return (
		<div {...useBlockProps()}>
			<InnerBlocks
				template={TEMPLATE}
				templateLock="all"
				allowedBlocks={['core/heading', 'core/paragraph']}
			/>
		</div>
	);
}
```

- `templateLock="all"` — fixed structure, no add/remove/move (use for a title + text block).
- `templateLock="insert"` — children can be reordered but not added/removed.
- `templateLock={false}` — the template is only a starting point; combine with `allowedBlocks` to constrain what editors may insert.

On the Next.js side, inner blocks arrive as `children` — render them inside your wrapper:

```tsx
export default function MyBlock({ children }: MyBlockProps) {
	return <div className="my-block">{children}</div>;
}
```

### Architecture

```
WordPress theme (editor)          Next.js (frontend)
─────────────────────────         ──────────────────
src/blocks/<name>/register.ts  →  (not used)
src/blocks/<name>/edit.tsx     →  (not used)
                                  components/custom/.../index.tsx
                                  components/custom/.../block.json  ← slug source of truth
                                  global/Blocks.tsx                 ← slug → component map
```

Data flow: Gutenberg saves `<!-- wp:namespace/block {"attr":"…"} /-->` → WPGraphQL `blocksJSON` → Next.js `<Blocks />`.

### Step 1: Create the Next.js component

Under `next/src/components/custom/`, create a folder with:

| File           | Purpose                                    |
| -------------- | ------------------------------------------ |
| `block.json`   | Block slug and title (source of truth)     |
| `typings.d.ts` | Attribute and props interfaces             |
| `index.tsx`    | Default export — frontend render component |
| `styles.css`   | Frontend styles (optional)                 |

**`block.json`** example:

```json
{
	"slug": "superstack/benefits-list-item",
	"title": "Avantage"
}
```

### Step 2: Register the block in Next.js

Add the slug to `blocksList` in [`next/src/components/global/Blocks.tsx`](../../next/src/components/global/Blocks.tsx):

```ts
'superstack/benefits-list-item': () =>
  import('../custom/molecules/BenefitsList/BenefitsListItem'),
```

Without this entry, the block saves in WordPress but Next.js will log a dev warning and render nothing.

### Step 3: Register the block in the WordPress editor

Create files under [`wordpress/theme/src/blocks/<name>/`](../../wordpress/theme/src/blocks/):

| File          | Purpose                          |
| ------------- | -------------------------------- |
| `register.ts` | Calls `registerBlockType`        |
| `edit.tsx`    | Gutenberg edit UI                |
| `edit.css`    | Editor preview styles (optional) |

**`register.ts`** — import `block.json` from Next via the `@/` webpack alias (`@` → `next/src`):

```ts
import { registerBlockType } from '@wordpress/blocks';

import block from '@/components/custom/molecules/BenefitsList/BenefitsListItem/block.json';

import Edit from './edit';

registerBlockType(block.slug, {
	title: block.title,
	category: 'superstack',
	icon: 'star-filled',
	attributes: {
		text: { type: 'string', default: '' },
	},
	supports: { anchor: false, multiple: true },
	edit: Edit,
	save: () => null,
});
```

**`edit.tsx`** — build the Gutenberg UI with `@wordpress/block-editor` components (`useBlockProps`, `InnerBlocks`, `RichText`, etc.). Start from `InnerBlocks` + a template of core blocks (see [Rule: prefer core blocks as inner blocks](#rule-prefer-core-blocks-as-inner-blocks)); reach for `RichText` only for data no core block covers.

### Step 4: Wire the block into the editor bundle

Add an import in [`wordpress/theme/src/blocks/index.ts`](../../wordpress/theme/src/blocks/index.ts):

```ts
import './benefits-list-item/register';
```

Ensure [`wordpress/theme/src/editor/editor.ts`](../../wordpress/theme/src/editor/editor.ts) loads the barrel:

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
- Post content should contain: `<!-- wp:your-namespace/your-block {"text":"…"} /-->`

**Next.js frontend**

- Load the page on the Next dev server.
- Confirm the component renders with the expected attributes.
- No dev warning: `The following block does not exist: your-namespace/your-block`.

**Type check** (optional):

```bash
cd next && npx tsc --noEmit
```

---

## Extending core blocks (filters)

To tweak an existing core block (e.g. limit heading levels, restrict post types), add an `edit.tsx` filter under `next/src/components/core/<Block>/` and export it from [`next/src/components/filters.ts`](../../next/src/components/filters.ts). This is different from registering a new custom block — see [`Heading/README.md`](../../next/src/components/core/Heading/README.md).

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

| Step                                           | Location                                |
| ---------------------------------------------- | --------------------------------------- |
| 1. `block.json` + `index.tsx` + `typings.d.ts` | `next/src/components/custom/...`        |
| 2. Register slug                               | `next/src/components/global/Blocks.tsx` |
| 3. `register.ts` + `edit.tsx`                  | `wordpress/theme/src/blocks/<name>/`    |
| 4. Barrel import                               | `wordpress/theme/src/blocks/index.ts`   |
| 5. Build theme assets                          | `npm --prefix ./wordpress run build`    |
| 6. Sync GraphQL registry                       | WP Admin → GraphQL → Gutenberg          |
| 7. Verify editor + frontend                    | —                                       |

## Parent / child blocks (optional)

For blocks that belong inside a wrapper (e.g. a list item inside a `<ul>`), register both blocks and set `parent` / `allowedBlocks` on the child once the parent exists.
