# Writing a documentation page

This site is content collections + plain markdown. Adding a page means adding one `.md` file — no
code changes required.

## Where things go

```
src/content/docs/<category>/<slug>.md      # the page
public/docs/<category>/<slug>/*.png        # its screenshots, same category/slug path
```

`<category>` must be one of the 8 fixed slugs: `getting-started`, `pages`, `blog`, `navigation`, `multilang`, `section`. See `src/content/categories.ts` for their labels
and `SPECS.md` for what each one covers (in particular the Features-vs-Section distinction).

## Frontmatter

```yaml
---
title: 'Section FAQ'
category: 'section'
subcategory: 'Autres' # optional — only for categories that define `subcategories` in categories.ts
summary: 'Un accordéon de questions fréquentes avec une carte de contact à droite.'
wordpressName: 'Section FAQ' # optional — the name as it appears in WP admin
figmaLink: 'https://figma.com/...' # optional — only if a real link exists, never invent one
image: '/docs/section/section-faq/overview.png' # optional — main visual shown under the title
imageAlt: "Section FAQ affichée dans l'éditeur"
previewImage: '/docs/section/section-faq/card-preview.png' # optional — thumbnail on the category-page card
icon: 'grid' # optional — see "Icons" below, only used when there's no previewImage
order: 2 # sort position within the category's card list
---
```

Schema lives in `src/content.config.ts`. A missing required field (`title`, `category`, `summary`)
fails `npm run build` with a clear zod error — that's the validation working as intended, don't
work around it.

`image` and `previewImage` are two different pictures, not duplicates: `image` is the full visual
shown on the doc page itself; `previewImage` is a smaller thumbnail (16:10) shown on the card that
links to it from the category listing page. Both optional — a doc page without a `previewImage`
just shows a plain text card, no thumbnail.

`subcategory` groups pages within a category-listing page behind filter pills (e.g. `section` is
split into Heroes / Cartes / CTA / Media / Autres). It only does anything if the category also
lists a `subcategories` array in `src/content/categories.ts` — a pill only appears if at least one
doc in that category carries the matching value. Categories without a `subcategories` list just
render a flat grid, no pills, same as before.

### Icons

`icon` is only relevant when a doc has no `previewImage` — its card would otherwise be plain text.
It must be one of the fixed names in `src/components/icons/icons.ts` (the same duotone set used for
the 8 category tiles on the homepage). If you leave it out, the card falls back automatically to
its own category's icon (e.g. any `navigation` doc without a `previewImage` shows the `grid-2`
icon) — set `icon` explicitly only if you want a doc to stand out with a different one. A doc that
does have a `previewImage` never shows an icon; the thumbnail wins.

## Writing style — make it scannable, not a wall of text

This is the one rule that matters most: **editors need to find the answer fast, not read a
manual.**

- Short paragraphs. If a paragraph is doing more than one thing, split it.
- Numbered steps for anything sequential; bullets for anything that isn't.
- **Bold** the exact UI label the editor needs to click (button names, panel names, field names) —
  not whole sentences.
- One `##`/`###` heading per logical chunk — headings become both the page's sticky table of
  contents and the anchors search results jump to, so they need to mean something on their own.
  Inside "Édition pas à pas" especially: split it into one `###` per component (e.g. `### Titre`,
  `### Boutons`, `### Images`) rather than one long flat numbered list, so an editor can jump
  straight to the part they need instead of scanning past everything else.
- A screenshot after a step earns its place if it removes ambiguity — don't caption the obvious.

The established shape for a Section/Features doc page (see `section/hero-homepage.md` for the
reference example):

1. **Intro** — one short paragraph + a bullet list of the section's key elements.
2. **Mobile** — one line on mobile-specific behavior, right after the intro list and before
   Insertion — only if there's something worth saying, otherwise omit it.
3. `## Insertion` — how to add the pattern to a page (the `+` → Compositions → category path), as
   its own section rather than buried in the intro paragraph.
4. `## Édition pas à pas` — one `###` subheading per component/theme, each with its own numbered
   step(s) and a screenshot where it helps.
5. `## À noter` — bullet list of constraints, gotchas, and things that are _not_ configurable.

## Images

Put screenshots in `public/docs/<category>/<slug>/`, named descriptively
(`01-insert-section.png`, not `image1.png`), and reference them with a root-relative path:

```md
![Bouton + et panneau Compositions](/docs/getting-started/gestes-de-base/01-insert-section.png)
```

They live in `public/`, not next to the `.md` file, because Astro only serves files from `public/`
as static assets — but the folder path always mirrors the content file's `<category>/<slug>`, so
they stay easy to find side by side.

## Using the AI scaffolding skill

For a new Section/Features/CPT page, `.claude/skills/create-doc-page` can read the matching
WordPress pattern or CPT file and draft the frontmatter + step skeleton for you. It never invents
screenshots or Figma links — it leaves explicit `TODO`s for those, since only a human can capture
a real screenshot from the live editor.
