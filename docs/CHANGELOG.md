# CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-10-21

Superstack 2 is a new stack, rebuilt from scratch: it is not an in-place upgrade of v1. Start new projects from v2. v1 is frozen on the `v1.x` branch and gets no fixes; projects built on it keep maintaining their own code.

### Added

-   **Next.js 16** (App Router, React Server Components, React 19) in `next/`, and a **WordPress 6.9** block theme in `wordpress/`, each with its own tooling.
-   **Full Site Editing templates**: pages, posts, archives, the 404 page and template parts (header, footer) are authored in the Site Editor and rendered by Next. See [FSE templating](./fse-templating.md).
-   **Cache Components with tag-based invalidation**: public pages and every WordPress read are cached until the [nextjs-revalidate](https://github.com/superhuit-agency/nextjs-revalidate) plugin (2.1) reports a change, which expires only the matching tags. Post, page, term, menu, template, settings and redirect changes are mapped. See [Caching](./caching.md).
-   **Core blocks rendered in Next**: post blocks (title, date, author, excerpt, featured image, terms, time to read, navigation links), query loops with pagination resolved at request time, term archives and Terms Query, breadcrumbs, navigation and submenus, accordion, reusable blocks, and patterns in the `/` inserter.
-   **Multilang** with Polylang and per-locale dictionaries, plus a script to switch a project between one language and several. See [Multilang](./setup/multilang.md) and [Translations](./setup/translations.md).
-   **Cookie consent (GDPR)** with Google Consent Mode v2 and Google Tag Manager, behind the `hasGdpr` flag. See [Cookie consent](./setup/gdpr.md).
-   **Draft Mode preview** with a dedicated secret, and a preview toolbar.
-   **Sitemap and redirects** (Redirection plugin), both served from the cache.
-   **Error page** for a page that fails to render before it was ever cached, in the current language.
-   **Theme CSS variables** generated from `theme.json` for Next. See [Theme CSS](./setup/theme-css.md).
-   **Typed WordPress reads** generated with GraphQL Codegen.
-   **Database migrations** run on deploy, with an audit trail and a scaffolder (`npm run generate:migration`).
-   **Tests and checks**: Vitest, `tsc` and ESLint (with a `usesBaseUri` rule) on every pull request.
-   **User documentation** site for editors in `user-documentation/`.
-   **AI assistant guidance**: `CLAUDE.md`, `AGENTS.md`, Copilot instructions and project skills in `.claude/skills/`.
-   [ADR 1](./adr/0001-block-errors-fail-the-public-render.md): a block whose data fails fails the public render, so a broken block is never cached.

### Changed

-   Blocks are created from core-block patterns or as custom Gutenberg blocks. See [Create a new block](./blocks/create-block.md).
-   Block data is read through `blocksJSON` (filtered properties) instead of nested `blocks` queries.

### Removed

-   **Forms** (starterpack-forms) are not in 2.0.0. They are planned for 2.1. See [the forms research](./research/forms.md).
-   The Next bundle analyzer (v2 builds with Turbopack).

### Known issues

-   A full page load of a page that fails to render before it was ever cached gets Next's plain-text `500 Internal Server Error` instead of the error page. This is a Next.js limitation ([#270](https://github.com/superhuit-agency/superstack/issues/270)).
-   After a parent category's slug changes, the child category's old URI still resolves ([#258](https://github.com/superhuit-agency/superstack/issues/258)).

## [1.x]

v1 (1.0.0 to 1.2.0) is frozen. Its changelog lives on the [`v1.x`](https://github.com/superhuit-agency/superstack/tree/v1.x) branch.

[2.0.0]: https://github.com/superhuit-agency/superstack/releases/tag/v2.0.0
[1.x]: https://github.com/superhuit-agency/superstack/tree/v1.x
