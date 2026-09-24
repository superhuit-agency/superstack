# Superstack Next.js

Frontend application for the Superstack project (headless WordPress + Next.js).

## Prerequisites

- Node.js / npm
- A running WordPress instance with GraphQL enabled (see root README / `wordpress/README.md`)

## Getting Started

Install dependencies:

```bash
npm install
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

## Custom Post Types

Adding a new CPT requires changes on both the WordPress and Next.js sides:

- [docs/custom-post-types.md](/docs/custom-post-types.md)

## Deployment

Project deployment is handled from repository workflows and documented in:

- [docs/setup/deployment.md](/docs/setup/deployment.md)
