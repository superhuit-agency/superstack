# Next.js / Wordpress Starter

An opinionated boilerplate for decoupled (headless) websites that are both performant (Next.js) and easy to edit (WordPress with Gutenberg block editor) — focused on accelerating custom blocks development.

## Features

**Highlights**

-   Create new blocks quickly via a CLI
-   Iterate efficiently on your blocks — Gutenberg and frontend code in the same folder
-   Easy data fetching through GraphQL
-   Save time with pre-built blocks and hooks

**Next.js**

-   Next.js 14 with App Router and React Server Components
-   Next.js Preview Mode
-   Next.js Cache Revalidation (via WordPress Plugin)

**The basics**

-   Typing with TypeScript
-   Styling with CSS (PostCSS) [why?](./docs/technical-choices.md)
-   Dynamic styleguide with Storybook
-   Dockerized
-   Multilang support

**Supported WordPress plugins**

-   [Yoast SEO](https://wordpress.org/plugins/wordpress-seo/)
-   [Redirection](https://wordpress.org/plugins/redirection/)
-   [ACF](https://wordpress.org/plugins/advanced-custom-fields/)
-   [Polylang Pro](https://wordpress.org/plugins/polylang/) (coming soon)

## Dependencies

| Name           | Version | Download                                                |
| -------------- | ------- | ------------------------------------------------------- |
| Nvm            | >= 0.38 | [nvm](https://github.com/creationix/nvm)                |
| Node           | >= 22.x | [node](https://nodejs.org/)                             |
| Docker         | >= 23   | [docker](https://www.docker.com/products/docker-engine) |
| Docker Compose | >= 1.29 | [docker-compose](https://docs.docker.com/compose/)      |

## 📄 Scripts Cheatsheet

### WordPress

(inside `/wordpress` folder)

-   `npm run start` - start WP server
-   `npm run stop` - stop WP server
-   `npm run build` - build Webpack for the assets on WP
-   `npm run dev` - start Webpack for the assets on WP (watch + hot reload)

Open [http://localhost/wp-admin/](http://localhost/wp-admin/) on your browser to access to the admin. (login: **superstack**, password: **superstack**)

### Next.js

-   `npm run dev` - start Next.js in development mode (watch + hot reload)
-   `npm run build` - build Next.js in production mode
-   `npm run start` - start a Next.js production server to test the production mode on local

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Storybook

-   `npm run storybook` - start Storybook

Open [http://localhost:4000](http://localhost:4000) with your browser to access to Storybook.

### Additional commands

-   `npm run generate:block` - create a new block (interactive prompt)

## 🏗 Project setup

-   [Getting Started](./docs/setup/installation.md)
-   [Add favicon](./docs/setup/add-favicon.md)
-   [Add fonts](./docs/setup/add-fonts.md)
-   [Create a Custom Post Type](./docs/setup/create-custom-post-types.md)
-   [WP Guides](./docs/setup/wordpress-guides.md)
-   [Deploy](./docs/setup/deployement.md)

## 🛠 Create a block

-   [How to create blocks](./docs/create-blocks/create-blocks.md)
-   [How to make a block editable](./docs/create-blocks/make-block-editable.md)
-   [How to fetch data](./docs/create-blocks/fetch-data.md)
-   [How to use and extend Core blocks](./docs/create-blocks/core-blocks.md)

## 🗝 Key features / How it works

-   [Preview](./docs/features/preview.md)
-   [Styling](./docs/features/styling.md)
-   [Cache Revalidation](./docs/features/revalidate-cache.md)
-   [Aliases](./docs/features/aliases.md)
-   [Helpers](./docs/features/helpers.md)
-   [Blocks Whitelisting](./docs/features/blocks-whitelisting.md)
-   [Forms](./docs/features/forms.md)
-   [Multilang](./docs/features/multilang.md)

## 📚 Resources

-   [List of blocks](./docs/resources/blocks.md)
-   [List of hooks](./docs/resources/hooks.md)
-   [Debugger](./docs/resources/debugger.md)

## Learning path

-   Learn Next.js in depth https://nextjs.org/learn
-   Learn about WPGraphQL https://wpengine.com/builders/everything-you-need-to-know-about-wpgraphql/#schema-and-types
-   Follow the logic we built for routing & data fetching, from `./src/app/[[...uri]]/page.tsx`

## Sources of inspiration

-   https://github.com/Automattic/vip-go-nextjs-skeleton
-   https://github.com/colbyfayock/next-wordpress-starter

## Contact

For bugs or feature requests, open an [issue](https://github.com/superhuit-agency/nextjs-wordpress-starter/issues).  
For other communication, contact the maintainers at <tech@superhuit.ch>
