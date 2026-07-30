---
name: create-doc-page
description: Scaffold a new page in the tipee.ch CMS user-documentation site (user-documentation/) by reading a WordPress pattern, CPT, or Next.js component and drafting frontmatter + a step skeleton. Use when the user asks to document a section/pattern/feature/CPT for CMS editors, or to add a page to the user documentation.
---

# Create a documentation page

Drafts a new page for the standalone Astro site in `user-documentation/` (fully decoupled from
`next/` and `wordpress/` — it only _reads_ those trees for context, never imports from them). The
site's audience is tipee.ch's WordPress editors, not developers: content must explain **how to use
the CMS**, not how the code works.

## Inputs to gather

| Input        | Constraint                                                                                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Target**   | A pattern file (`wordpress/theme/patterns/section-*.php` or `hero-*.php`), a CPT (`wordpress/theme/includes/post-types/*.php`), or a Next component (`next/src/components/**`) |
| **Category** | One of the 8 fixed slugs in `user-documentation/src/content/categories.ts`: `getting-started`, `pages`, `blog`, `navigation`, `multilang`, `section` — do not invent a new one |
| **Slug**     | kebab-case, defaults to the target file's basename without extension                                                                                                           |

If the target doesn't obviously map to one of the 8 categories, ask — don't guess (see
`user-documentation/SPECS.md` for the Features-vs-Section distinction).

## Step 1 — Read the source

- **Pattern file** (a Section doc): read the PHP to find the static example text/images and any
  repeatable inner blocks (loops of Card/Item/Testimonial blocks) — each repeatable component
  becomes one `##` step group. Note any section-level settings exposed as block attributes
  (background color choices, number of tags/pastilles) — these belong in "À noter".
- **CPT** (a Features/Partners doc): read `includes/post-types/<slug>.php` for the registered
  fields, plus `includes/meta/`, `includes/graphql/`, and `includes/taxonomies/` for custom
  fields (icon, color, taxonomy) — see `includes/post-types/feature.php` for a CPT with icon/color
  meta as a reference shape.
- **Next component**: read the component's typings/props for repeatable inner elements the WP
  pattern doesn't make obvious from PHP alone.

## Step 2 — Draft the content file

Create `user-documentation/src/content/docs/<category>/<slug>.md`. Check sibling files in that
category folder first to pick the next `order` value.

Frontmatter (schema: `user-documentation/src/content.config.ts`):

```yaml
---
title: '<Human title>'
category: '<one of the 8 slugs>'
summary: '<one sentence, shown on the category-page card>'
wordpressName: '<TODO: confirm the exact composition/CPT name as it appears in WP admin>'
image: '/docs/<category>/<slug>/overview.png' # TODO: screenshot not yet captured
order: <next available number>
---
```

Leave `figmaLink` out entirely unless a real Figma URL is known — do not fabricate one.

Body — follow the scannable style used by every other page on this site (see
`user-documentation/docs/CONTENT_GUIDE.md`): short paragraphs, **bold** UI labels, no walls of
text. Structure (see `section/hero-homepage.md` for the reference shape):

1. **Intro** — 1 short paragraph + a bullet list of the section/CPT's key elements.
2. **Mobile** — one line right after the intro bullet list, before Insertion, if the pattern has
   any mobile-specific behavior worth calling out (columns stacking, hidden elements, etc.). Skip
   this line entirely if there's nothing mobile-specific to say — don't pad it.
3. `## Insertion` — how to add the pattern to a page (the `+` → **Compositions** → category path),
   pulled out as its own section rather than folded into the intro paragraph.
4. `## Édition pas à pas` — grouped under one `###` subheading per repeatable/thematic component
   found in Step 1 (e.g. `### Titre`, `### Textes`, `### Boutons`, `### Images`), each with its own
   numbered step(s) and a placeholder image line right after: `<!-- TODO: screenshot -->`. These
   `###` headings are load-bearing, not decorative: they become sticky-TOC anchors so an editor can
   jump straight to the part they need (e.g. "Boutons") instead of scanning a flat numbered list —
   don't collapse them back into one undivided list.
5. `## À noter` — bullet list skeleton with one `TODO` bullet per section-level setting/constraint
   found in Step 1 (character limits, locked blocks, fixed colors, etc.) — fill in what's
   verifiable from the code, mark the rest `TODO: confirm in the editor`.

## Step 3 — Reserve the assets folder

Create `user-documentation/public/docs/<category>/<slug>/` (empty is fine). By default, screenshots
are **captured manually from the live WP admin editor by a human** — this skill never invents or
fetches images on its own. State clearly in your report which images are still missing.

## Step 3b — Automated screenshot capture (optional, on request only)

If the user explicitly asks for it, and a local WordPress instance is reachable (typically
`http://localhost/wp-admin/`), you can capture real screenshots yourself by driving a browser
against that instance (e.g. via the Chrome DevTools MCP tools). Do not do this by default — only
when asked, since it edits real WordPress content (even if in a disposable sandbox) and takes
noticeably longer than leaving TODO placeholders.

**Auth**: if navigating to wp-admin redirects to `wp-login.php`, the automation browser isn't
authenticated. Ask the user to log into that browser window themselves rather than handling
credentials — the session cookie then persists for the rest of the task.

**Sandbox, never real content**: create a disposable draft page for this (e.g. title
`[TEST] <slug>`), insert the pattern/composition being documented via the block inserter, capture
the screenshots there, then **trash the draft page when done**. Never capture from or edit a real
published page.

**Navigating nested/dynamic blocks**: Gutenberg's List View is the reliable way to select a
specific inner block (canvas clicks on a dynamic block's placeholder tend to just select its
wrapping Group). Its disclosure triangle isn't always a distinctly clickable target through normal
accessibility-tree clicks — if clicking it doesn't expand the row, fall back to
`evaluate_script` to click the `.block-editor-list-view__expander` element directly, e.g.:

```js
() => {
	const leaves = Array.from(
		document.querySelectorAll('.block-editor-list-view-leaf')
	);
	const leaf = leaves.find((l) => l.textContent.includes('List Partners')); // match the block name
	leaf.querySelector('.block-editor-list-view__expander')?.click();
};
```

**Framing**: match the tight, cropped style of existing manual screenshots — don't just capture
the full viewport (toolbar, right sidebar, breadcrumb footer included) unless that chrome is
actually relevant to the step. Prefer passing a specific element `uid` to the screenshot tool, or
crop afterward, so captures read the same as the rest of the site.

**Content-dependent states**: some steps only look right with real fixture data (e.g. a dynamic
block that lists Partners of a given category needs actual Partner posts in that category to exist
— a fresh sandbox page won't show them). If the local instance has no matching fixture data, don't
fake it: leave a `TODO` noting the state couldn't be demonstrated and why, same as a missing
screenshot would be flagged in the manual flow.

**Cleanup is mandatory**: once screenshots are captured and copied into
`public/docs/<category>/<slug>/`, trash the sandbox draft page in WordPress before finishing.

## Step 4 — Verify

```bash
cd user-documentation && npm run build
```

A zod validation error here almost always means a required frontmatter field is missing — fix the
frontmatter, don't weaken the schema. Confirm the new page's category route lists it.

## What this skill does not do

- Does not take screenshots by default — that's manual unless the user explicitly asks for
  automated capture (Step 3b). Never invents a Figma link — that always requires a human.
- Does not modify `content.config.ts` or `categories.ts` — the 8 categories are fixed by design.
- Does not import anything from `next/` or `wordpress/` into the Astro site — it only reads those
  trees as reference material.

## Output Format

1. File(s) created (paths).
2. Category and `order` used, and why.
3. Every `TODO` left in the draft (wordpressName confirmation, figma link, and — if screenshots
   weren't captured via Step 3b — screenshots too) — these are for a human to close, not
   follow-up work for this skill.
4. If Step 3b ran: confirm the sandbox page was trashed, and flag any state that couldn't be
   demonstrated for lack of fixture data.
5. `npm run build` result.
