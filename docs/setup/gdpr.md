# Cookie consent (GDPR) and Google Tag Manager

The Next.js app ships a cookie consent banner built on [Google Consent Mode v2](https://developers.google.com/tag-platform/security/guides/consent), and loads Google Tag Manager (GTM) when a container ID is set.

## Configuration

### The feature flag

The banner is turned on and off with `hasGdpr` in `next/src/configs.json` (on by default):

```json
{
	"hasGdpr": true
}
```

| `hasGdpr` | Behaviour                                                                                                                                                                                                                   |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `true`    | Consent Mode defaults are pushed before GTM loads, the banner shows until the visitor chooses, and the choices are kept in cookies.                                                                                         |
| `false`   | No banner or modal, no consent cookie read or written, no Consent Mode defaults pushed, and the banner's code isn't shipped to the browser. GTM still loads when an ID is set, for projects that handle consent inside GTM. |

### The GTM container

GTM loads only when `GOOGLE_TAG_MANAGER_ID` is set in `next/.env` (see `next/.env.example`):

```sh
GOOGLE_TAG_MANAGER_ID=GTM-XXXXXXX
```

It is read when the root layout renders, which is at build time: set it in the build environment, and rebuild after changing it. Without it, no GTM script is loaded, whatever the flag.

With GTM loaded, a `{ event: 'pageview', page_path }` event is pushed to the `dataLayer` on the first load and on every client-side navigation, which the App Router doesn't report on its own. Use it as a custom event trigger in GTM.

## Consent Mode behaviour

1. Before GTM loads, an inline script in the root layout pushes the defaults, everything denied:

    ```js
    gtag('consent', 'default', {
    	ad_storage: 'denied',
    	analytics_storage: 'denied',
    	ad_user_data: 'denied',
    	ad_personalization: 'denied',
    	wait_for_update: 500,
    });
    ```

2. The visitor accepts, refuses or personalizes the categories. Each choice is kept for a year in a `supt-cookie-law-consent_<category>_accepted` cookie (`yes` / `no`), and `supt-cookie-law-consent_banner=dismiss` hides the banner.
3. The consent types of the accepted categories are granted with a `gtag('consent', 'update', …)`. On the next visits, the update is pushed again from the cookies when the page loads.

GTM tags then follow Consent Mode: configure their consent checks in GTM ("Consent Settings" of each tag).

## Categories

The categories are set in `next/src/gdpr-configs.json`:

```json
{
	"cookieName": "supt-cookie-law-consent",
	"hash": "manage-cookies",
	"categories": [
		{ "id": "necessary", "mandatory": true },
		{
			"id": "analytics",
			"services": ["gtm"],
			"consentTypes": ["analytics_storage"]
		}
	]
}
```

| Key            | Description                                                                                                                                                                            |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`           | Identifies the category in the cookies and in the dictionaries.                                                                                                                        |
| `mandatory`    | Always enabled: the visitor can't turn it off.                                                                                                                                         |
| `services`     | The services the category covers, for reference.                                                                                                                                       |
| `consentTypes` | The Consent Mode types granted when the category is accepted (`ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization`). Types no accepted category grants stay denied. |

To ask for advertising consent, add a category, e.g. `{ "id": "marketing", "consentTypes": ["ad_storage", "ad_user_data", "ad_personalization"] }`, and its texts in the dictionaries.

### Texts

The banner, modal and category texts live in the `gdpr` keys of each dictionary (`next/src/i18n/dictionaries/{locale}.json`), so they follow the current language. Every dictionary needs them: a category needs `title` and `description`, plus `alwaysEnabled` when mandatory, or `enable`, `disable`, `enabled` and `disabled` otherwise. The language migration script (`npm run generate:language-migration`) seeds new dictionaries with the English ones.

### Reopening the modal

A link to `#manage-cookies` (the `hash` of `gdpr-configs.json`) opens the cookie settings, e.g. in the footer:

```html
<a href="#manage-cookies">Manage cookies</a>
```

## Turning it off

Set `"hasGdpr": false` in `next/src/configs.json`. To drop GTM as well, leave `GOOGLE_TAG_MANAGER_ID` unset.

## Files

| Path                                                         | Role                                                           |
| ------------------------------------------------------------ | -------------------------------------------------------------- |
| `next/src/components/global/Analytics.tsx`                   | Mounted in the root layout: Consent Mode defaults, banner, GTM |
| `next/src/components/custom/molecules/Gdpr/`                 | The banner, the modal and the categories                       |
| `next/src/components/custom/molecules/Gdpr/consent.ts`       | Consent Mode defaults and updates, consent cookies             |
| `next/src/components/custom/atoms/GoogleTagManagerPageview/` | `pageview` events on client-side navigations                   |
| `next/src/gdpr-configs.json`                                 | Cookie name, hash and categories                               |
