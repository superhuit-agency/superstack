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

| Command | Description |
| --- | --- |
| `dev` | Start the Next.js dev server |
| `predev` | Fetch FSE templates/parts data before `dev` |
| `build` | Build Next.js for production |
| `prebuild` | Fetch FSE templates/parts data before `build` |
| `start` | Run the production server (`next start`) |
| `lint` | Run ESLint |
| `storybook` | Start Storybook on port 6006 |
| `build-storybook` | Build Storybook static output |

## Pages FSE Templates

- `predev` and `prebuild` run `scripts/fetch-fse-templates-and-parts.ts`.
- This script writes data used by template rendering to `src/lib/fse/fse-templates-and-parts.json`.
- See [docs/fse-templating.md](/docs/fse-templating.md) for a full explanation of the FSE templating architecture.

## Deployment

Project deployment is handled from repository workflows and documented in:

- [docs/setup/deployment.md](docs/setup/deployment.md)
