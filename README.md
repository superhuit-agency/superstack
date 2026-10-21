# Superstack: Next.js / WordPress Starter

An opinionated boilerplate for decoupled (headless) websites that are both performant (Next.js) and easy to edit (WordPress with Gutenberg block editor) — focused on accelerating custom blocks development.

> **Superstack 2** is a new stack, rebuilt from scratch: it is not an in-place upgrade of v1. Start new projects from v2 (`main`). v1 is frozen on the [`v1.x`](https://github.com/superhuit-agency/superstack/tree/v1.x) branch and gets no fixes. See the [changelog](./docs/CHANGELOG.md).

## Features

**Highlights**

-   Pages, archives, the 404 page, header and footer authored as Full Site Editing templates in WordPress
-   Core blocks rendered in Next.js, with pre-built post, query loop, navigation and breadcrumb blocks
-   Easy data fetching through GraphQL, typed with GraphQL Codegen
-   Create blocks from patterns or as custom Gutenberg blocks ([guide](./docs/blocks/create-block.md))

**Next.js**

-   Next.js 16 with App Router and React Server Components
-   Draft Mode preview
-   Cache Components with tag-based invalidation (via the [nextjs-revalidate](https://github.com/superhuit-agency/nextjs-revalidate) WordPress plugin)

**The basics**

-   Typing with TypeScript
-   Styling with CSS (PostCSS)
-   Dynamic styleguide with Storybook
-   Tests with Vitest
-   Dockerized
-   Multilang support
-   Cookie consent (GDPR) with Google Consent Mode v2

# Table of Contents

1. [Project setup](#-project-setup)
1. [WordPress](#wordpress)
1. [Next.js](#nextjs)

## 🏗 Project setup

- [Getting Started](#getting-started)
- [Deploy](./docs/setup/deployment.md)
- [Caching](./docs/caching.md)
- [FSE templating](./docs/fse-templating.md)
- [Multilang](./docs/setup/multilang.md) and [translations](./docs/setup/translations.md)
- [Theme CSS](./docs/setup/theme-css.md), [fonts](./docs/setup/add-fonts.md) and [favicon](./docs/setup/add-favicon.md)
- [Parallel local instances](./docs/setup/parallel-local-dev.md)
- [Cookie consent (GDPR) and Google Tag Manager](./docs/setup/gdpr.md)


## WordPress

Custom WordPress theme built on top of the block editor (Gutenberg), running in a Docker-based local development environment.

### Prerequisites

- Docker
- Node.js / npm

### Getting Started

1. *(Optional)* Set up Composer auth for privately hosted packages:
   ```bash
   npm --prefix ./wordpress run setup-composer-auth -- <domain> <username> <password>
   ```
2. Start the local environment:
   ```bash
   npm --prefix ./wordpress start
   ```

### Available Scripts

| Command | Description |
| --- | --- |
| `start` | Start the WordPress development environment |
| `stop` | Stop the WordPress development environment |
| `setup-composer-auth` | Set one Composer auth entry (`domain user password`) |
| `dev` | Start development theme assets build |
| `build` | Build theme assets |
| `clear-cache` | Clear patterns cache |

### Development

```bash
npm --prefix ./wordpress run dev
```

For more details, see the [WordPress README](wordpress/README.md).

## Next.js

### Installation

```bash
cd next
npm install
cp .env.example .env # preview is refused without WORDPRESS_PREVIEW_SECRET
```

### Development

```bash
npm run dev
```


