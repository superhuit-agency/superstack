# 🪝 Hooks available and where to use them

The boilerplate comes with a few hooks that you can use as helpers in your code. They are separated into two categories "wordpress hooks" and "frontend hooks".

## WordPress hooks

They are located inside the `wordpress/theme/lib/editor/hooks` folder. They must not be used in the frontend, only in the WordPress area (`edit.tsx` file).

### Hooks available

-   `useGraphQlApi`: A hook to make GraphQL requests to the WordPress API
-   `useRestApi`: A hook to make REST requests to the WordPress API
-   `useAcfField`: A hook to get the value of an ACF (Advanced Custom Fields) field
-   `useIsPostType`: A hook to get if the post type(s) passed as parameter is/are the same as the current post type(s)
-   `useLocale`: A hook to retrieve the current locale in WordPress editor (for Polylang plugin)

## Frontend hooks

They are located inside the `frontend/src/hooks` folder and can be used in the frontend area.

### Hooks available

-   `useCanonical`: A hook to get the canonical URL of the current page
-   `useHandleInternalLink`: A hook to handle user-generated links with next/router
-   `useTranslation`: A hook to get the translation of a string
