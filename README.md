# Superstack: Next.js / WordPress Starter

An opinionated boilerplate for decoupled (headless) websites that are both performant (Next.js) and easy to edit (WordPress with Gutenberg block editor) — focused on accelerating custom blocks development.

## Features

**Highlights**

-   Create new blocks quickly via a CLI
-   Iterate efficiently on your blocks — Gutenberg and frontend code in the same folder
-   Easy data fetching through GraphQL
-   Save time with pre-built blocks and hooks

**Next.js**

-   Next.js 16 with App Router and React Server Components
-   Next.js Preview Mode
-   Next.js Cache Revalidation (via WordPress Plugin)

**The basics**

-   Typing with TypeScript
-   Styling with CSS (PostCSS)
-   Dynamic styleguide with Storybook
-   Dockerized
-   Multilang support

# Table of Contents

1. [Project setup](#-project-setup)
1. [WordPress](#wordpress)
1. [Next.js](#nextjs)

## 🏗 Project setup

- Getting Started
- [Deploy](./docs/setup/deployment.md)


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
```

## Development

```bash
npm run dev
```


