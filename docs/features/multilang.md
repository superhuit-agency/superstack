# Multilanguage Support

This document explains how to set up and manage multilanguage support in your website.

## Overview

Multilang is based on Polylang plugin on WP side, and NextJS is handling the routing and fetching of the correct content based on the URL.

## Implementation Details

### WordPress Setup

1. Install and activate Polylang plugin
2. Configure your desired languages in WordPress admin (Settings > Languages)
3. Set your default language

### Frontend Implementation

1. Set `isMultilang` to `true` in `./src/configs.json`
2. Create a folder named `[lang]` inside `./src/app/` and move `[[...uri]]` folder inside of it (and all files that are inside)
3. Create a `middleware.ts` file in `./src/`
4. Update `./src/app/layout.tsx` to handle multilang support
   a. Add `LocaleProvider` to the `Layout` component that wraps the `MainNav` and `Footer` components, as well as the `children`
   b. Send the `locale` to the `LocaleProvider` that comes from the page `params`
   c. Add `dictionaries` to the `Layout` component that comes from the `getDictionaries` helper, and pass it to the `LocaleProvider`

### Development Guidelines

-   Use language-aware data fetching in GraphQL queries
-   Use the `useLocale` hook to get the current locale and the `dictionary` object to get the static strings translations
-   Any component that needs to use the `useLocale` hook will need to be a Client component
-   For the language switcher, we use the `<link rel="alternate" hrefLang="x" href="url">` tags to get the available translations on each page
-   The 404 page won't have a header or footer, as we can't know which language to use when fetching the datas.

## Troubleshooting

Common issues and solutions:

1. URL Issues:

    - Verify permalink settings
    - Check language URL configuration in Polylang
    - Clear permalink cache after configuration changes

2. Data fetching issues:

    - Ensure GraphQL requests include language parameters

## Additional Resources

-   [Polylang Documentation](https://polylang.pro/doc/)
