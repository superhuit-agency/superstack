---
title: 'Multilangue'
category: 'developpers'
subcategory: 'Architecture'
summary: "Architecture du support multilingue : Polylang côté WordPress, routing i18n côté Next.js."
order: 2
---

## Principles

- Content is translated and managed in WordPress via Polylang
- URL routing uses language subpaths: `/{lang}/{slug}`
- UI strings are translated through JSON dictionary files in Next.js

## Configuration

All multilang behaviour is controlled by `next/src/configs.json`:

```json
{
  "isMultilang": true,
  "staticLang": "fr",
  "hasCurrentLocaleInLangSwitcher": true
}
```

| Key | Description |
|-----|-------------|
| `isMultilang` | Enables multilang mode. Set to `false` to run as a single-language site. |
| `staticLang` | The default/fallback locale (used when multilang is off, and as the fallback in middleware). |
| `hasCurrentLocaleInLangSwitcher` | When `true`, prepends the current page's own translation to the `translations` array returned by `getNodeByURI`, so the active language appears in the language switcher. |

## Architecture

### WordPress side
- **Polylang** manages language variants of each content type
- **wp-graphql-polylang** exposes `language`, `translation(language: LANG)`, and `translations` fields on GraphQL types
- **starterpack-i18n** adds `isRedirected` and `defaultLanguage` to the GraphQL schema
- Language defaults (FR + EN, `hide_default: false`) are seeded in `wordpress/theme/includes/admin/polylang-defaults.php`

### Next.js side

| File | Role |
|------|------|
| `src/configs.json` | Feature flags and default locale |
| `src/middleware.ts` | Redirects the root `/` to `/{locale}` based on the browser's `Accept-Language` header |
| `src/app/[lang]/layout.tsx` | Loads the dictionary for the current locale and wraps children in `LocaleProvider` |
| `src/app/[lang]/[[...uri]]/page.tsx` | Passes `lang` to `getNodeByURI` to fetch the correct translation from WP |
| `src/lib/get-all-uris.ts` | In multilang mode, fetches `language { code }` per node and maps URIs to `{ lang, uri }` pairs for `generateStaticParams` |
| `src/lib/get-node-by-uri.ts` | Wraps type fragments in `translation(language: LANG) { ... }` when multilang is enabled |
| `src/lib/fragments/language.ts` | GraphQL `language { code, locale }` fields — empty string when `isMultilang: false` |
| `src/lib/fragments/translations.ts` | GraphQL `translations { uri, language { ... } }` fields — empty string when `isMultilang: false` |
| `src/i18n/get-locales.ts` | Fetches active languages and default language from WP GraphQL |
| `src/i18n/dictionaries.ts` | Server-only loader — dynamically imports `dictionaries/{locale}.json`, falls back to `staticLang` |
| `src/i18n/dictionaries/` | One JSON file per locale for UI strings (e.g. `fr.json`, `en.json`) |
| `src/contexts/locale-context.tsx` | `LocaleProvider` component and `useLocale()` hook |

## Adding a language

1. Add the language in **WP Admin → Languages** (Polylang)
2. Add a dictionary file: `next/src/i18n/dictionaries/{slug}.json`
3. Add the slug to the `locales` array in `next/src/middleware.ts`

## Using translations in components

### Server components

```tsx
import { getDictionary } from '@/i18n/dictionaries';

export default async function MyServerComponent({ lang }: { lang: Locale }) {
  const dictionary = await getDictionary(lang);
  return <p>{dictionary.myKey ?? 'Fallback text'}</p>;
}
```

### Client components

```tsx
'use client';
import { useLocale } from '@/contexts/locale-context';

export function MyClientComponent() {
  const { locale, dictionary } = useLocale();
  return <p>{dictionary.myKey ?? 'Fallback text'}</p>;
}
```

## Switching between multilang and single language

A migration script handles the structural changes in both directions (moves `[[...uri]]` in/out of the `[lang]` segment, swaps the layouts, updates `configs.json`, `proxy.ts`, `typings.d.ts`, `locale-context.tsx` and the `IS_MULTILANG` default in `wordpress/scripts/provision.sh`):

```bash
# interactive
npm run generate:language-migration

# non-interactive (first locale = default locale)
node generators/lang-migration.js to-multilang fr en
node generators/lang-migration.js to-singlelang fr
```

After migrating, restart WordPress (`cd wordpress && npm run start`) so `provision.sh` activates/deactivates the multilang plugins. The plugins stay in `composer.json` in both modes.

## Disabling multilang

Run the migration script above, or manually: set `isMultilang: false` in `src/configs.json`. The app will behave as a single-language site using `staticLang`. No other changes are needed — the `languageFields` and `translationsFields` GraphQL fragments become empty strings, and `get-all-uris.ts` / `get-node-by-uri.ts` fall back to their single-lang paths.

Note: with the manual approach, the `[lang]` segment in the URL will still be present in the route. To remove it entirely, move the route back to `src/app/[[...uri]]/page.tsx` (the script does this for you).

## To go further

- [Next.js i18n routing](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [Polylang](https://polylang.pro/)
- [Starterpack I18n](https://github.com/superhuit-agency/starterpack-i18n)
- [wp-graphql-polylang](https://github.com/valu-digital/wp-graphql-polylang)
