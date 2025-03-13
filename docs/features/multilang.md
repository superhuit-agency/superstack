# 🌍 Multilang

## Overview

Multilang is based on Polylang plugin on WP side, and NextJS is handling the routing and fetching of the correct content based on the pathname.

## Implementation Details

We've created a plop script that simplifies the process of migrating between single language and multilanguage setups.

### Step 1 : Run the script

Run the script that will update the code and files depending on if your website supports multilang or not :

```bash
npm run generate:language-migration
```

Follow the prompts to choose the migration type and enter the required information.

### Step 2 : Restart Docker

After running the migration script, you may need to re-run the `provision.sh` script to activate/deactivate the appropriate plugins depending on your multilang configuration.

### Step 3 : Set your languages on WP

On WP admin, set the languages and the default one in Polylang settings

## Development Guidelines

If working on a multilang website :

-   Use language-aware data fetching in GraphQL queries
-   Use the `useLocale` hook to get the current `locale`, and the `dictionary` object to get the static strings translations
-   If you need to add static strings translations, set them on the `[language].json` file which is located inside the `src/i18n/dictionaries/` folder. The locales used in here are the ones set on WP Polylang plugin.
-   Any component that needs to use the `useLocale` hook will need to be a Client component
-   For the language switcher, we use the `<link rel="alternate" hrefLang="x" href="url">` tags to get the available translations on each page
-   The 404 page won't have a header or footer, as we can't know which language to use when fetching the datas in this specific case.

## Language Migration Generator

If you'd like to go further on how the multilang script is working, here are the steps it follows :

### Migration Types

1. **Single language to multilanguage**

    This migration type will:

    - Create a `[lang]` folder in the app directory
    - Create a `layout.tsx` file in the `[lang]` folder based on the template set in `generators/templates/lang-migration`
    - Update the root `layout.tsx` file for multilanguage support
    - Move the `[[...uri]]` folder into the `[lang]` folder
    - Update `src/configs.json` to set `isMultilang` to `true` and `staticLang` to the specified default locale
    - Update `wordpress/scripts/provision.sh` to set `IS_MULTILANG` to `true`

2. **Multilanguage to single language**

    This migration type will:

    - Update the root `layout.tsx` file for single language support
    - Move the `[[...uri]]` folder out of the `[lang]` folder
    - Remove the `[lang]` folder
    - Update `src/configs.json` to set `isMultilang` to `false` and `staticLang` to the specified default locale
    - Update `wordpress/scripts/provision.sh` to set `IS_MULTILANG` to `false`
