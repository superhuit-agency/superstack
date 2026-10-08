# Superstack Next.js

Frontend application for the Superstack project (headless WordPress + Next.js).

## Prerequisites

- Node.js / npm
- A running WordPress instance with GraphQL enabled (see root README / `wordpress/README.md`)

## Getting Started

Install dependencies and create your environment file:

```bash
npm install
cp .env.example .env # preview is refused without WORDPRESS_PREVIEW_SECRET
```

Start development:

```bash
npm run dev
```

## Available npm Scripts

| Command           | Description                              |
| ----------------- | ---------------------------------------- |
| `dev`             | Start the Next.js dev server             |
| `build`           | Build Next.js for production             |
| `start`           | Run the production server (`next start`) |
| `lint`            | Run ESLint                               |
| `test`            | Run the Vitest suite once                |
| `storybook`       | Start Storybook on port 6006             |
| `build-storybook` | Build Storybook static output            |

## Pages FSE Templates

- FSE templates and template parts are read from WordPress at runtime by `src/lib/get-fse-templates.ts`.
- The read is cached until the `templates` cache tag is revalidated, so template edits reach the site without a deploy.
- See [docs/fse-templating.md](/docs/fse-templating.md) for a full explanation of the FSE templating architecture.

## Caching

- Content read from WordPress is cached indefinitely and refreshed by tag when the nextjs-revalidate plugin reports a change.
- See [docs/caching.md](/docs/caching.md) for the tag scheme, the revalidate route, sizing the cache and the known risks.

## Custom Post Types

Adding a new CPT requires changes on both the WordPress and Next.js sides:

- [.claude/skills/add-custom-post-type/SKILL.md](/.claude/skills/add-custom-post-type/SKILL.md)

## Deployment

Project deployment is handled from repository workflows and documented in:

- [docs/setup/deployment.md](/docs/setup/deployment.md)
