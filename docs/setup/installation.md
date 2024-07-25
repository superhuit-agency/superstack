# 🏗 Getting Started

Follow these steps to install the stack for the 1st time:

-   `cp .env.local.example .env.local` - make default environment variables available to Next.js, Storybook and WordPress
-   `nvm use`
-   `npm install` - install global packages
-   `cd wordpress && npm install` - install WordPress-specific packages

### WordPress

-   `cp ./wordpress/auth.json.example ./wordpress/auth.json && sed -i '' -e 's/##username##/__LOGIN__/g' -e 's/##password##/__PASSWORD__/g' ./wordpress/auth.json` - Setup the auth for pro plugin (do not forget to replace `__LOGIN__` & `__PASSWORD__` with actual credentials)
-   `cd wordpress`
-   `npm run build:assets`
-   `npm run start:wp`

Open [http://localhost/wp-admin/](http://localhost/wp-admin/) on your browser to access to the admin. (login: **superstack**, password: **superstack**)

### Next.js

-   `npm run dev`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Having issues? See [TROUBLESHOOTING.md](../TROUBLESHOOTING.md)

### Storybook

-   `npm run storybook`

Open [http://localhost:4000](http://localhost:4000) with your browser to access to Storybook.
