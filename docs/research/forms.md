# Research: a free, lightweight replacement for starterpack-forms

Issue: [#261](https://github.com/superhuit-agency/superstack/issues/261), split out of #102. Facts checked on **2026-10-20**.

`main` ships starterpack-forms, which needs ACF PRO (paid). `future` has no form solution yet. This document compares free form plugins with keeping starterpack-forms and dropping its ACF PRO dependency (the "baseline"). It ends with one recommendation for the team to decide on. Nothing has been installed or implemented.

**Recommendation in one line:** keep starterpack-forms, remove ACF PRO and port it to `future` (see [Recommendation](#recommendation)). No free third-party plugin meets the nine must-haves with less work or less bloat.

## Contents

- [Method](#method)
- [The baseline today](#the-baseline-today)
- [Verdicts at a glance](#verdicts-at-a-glance)
- [Comparison: must-haves](#comparison-must-haves)
- [Comparison: bloat](#comparison-bloat)
- [Comparison: health](#comparison-health)
- [Eliminated candidates](#eliminated-candidates)
- [Shortlist, costed for this stack](#shortlist-costed-for-this-stack)
- [Recommendation](#recommendation)
- [Open questions for the team](#open-questions-for-the-team)
- [Sources](#sources)

## Method

- **Versions checked:** the WordPress.org stable version of each plugin on 2026-10-20, listed in every table. Jetpack Forms is the `automattic/jetpack-forms` 8.3.2 package bundled in Jetpack 16.3.1. The baseline is starterpack-forms v1.1.1, the version `main` pins.
- **Health data:** the WordPress.org plugin API (`plugins/info/1.2`) for version, last update, active installs and support threads.
- **Plugin size:** the `Content-Length` of each WordPress.org download zip, read with a HEAD request. No zip was downloaded.
- **Code:** read online at the tagged version.
  - WordPress.org plugins: the SVN tag (`plugins.svn.wordpress.org/<slug>/tags/<version>/`), which is the same tree as `plugins.trac.wordpress.org/browser/<slug>/tags/<version>/`. Trac blocks non-browser clients.
  - Plugins developed on GitHub: the GitHub tag.
- **Security advisories:** counted over 2024-10-20 → 2026-10-20 from Patchstack, WPScan and wpvulnerability.net, which aggregates Wordfence, Patchstack, WPScan and CVE. The counts differ between databases, so each count names its database.
- **Release cadence:** 2025-10-20 → 2026-10-20, from the SVN tag log, the readme changelog or GitHub releases.
- **Cell format:** every cell is short. Its source is the key in square brackets, listed under [Sources](#sources) with the file and the version.
- **Unchecked claims** are marked **unverified**. No throwaway spike was run, so the headless claims come from reading the code, not from a running instance.

The **nine must-haves** from the issue, by number:

1. Free: no paid add-on and no paid dependency.
2. Editors build forms in WordPress, Gutenberg preferred.
3. Headless: Next reads the definition and submits from its server through an API.
4. Field types matching the baseline, including file upload; required fields; server-side field errors.
5. Spam check verified server-side: Turnstile, hCaptcha or a honeypot.
6. Notification emails to configurable recipients, plus an optional confirmation email to the submitter.
7. Entries stored in the admin and exportable as CSV.
8. Works with Polylang.
9. GDPR: a consent field, and a way to delete or expire entries.

## The baseline today

What starterpack-forms 1.1.1 does on `main`, read from its code:

- **Forms:**
  - Forms are a `form` custom post type built from the theme's `supt/input-*` Gutenberg blocks [spf-type]. The blocks are text, email, textarea, select, checkbox(es), radio, file and section break.
  - On save, the parsed blocks are copied to the `form_fields` post meta [spf-type].
- **GraphQL:** the plugin exposes a `form` type with `fields` (a JSON string), `optIns` and `strings` [spf-type]. Next renders it with `react-hook-form` [main-form].
- **Submission:**
  - The browser posts to `/api/submit-form/`. A `next.config.js` rewrite forwards it to WordPress, adding `WORDPRESS_FORMS_SECRET` to the query string [main-next].
  - WordPress checks hCaptcha (`WORDPRESS_HCAPTCHA_SECRET`), then validates with `symfony/validator` and answers `{ errors: { <field>: [messages] } }` [spf-sub].
  - Files are uploaded first, in chunks, through `/api/submit-form/upload/` [main-next], [spf-sub].
- **Emails:** a notification and a confirmation email to the submitter, with "send to", "send from" and a template [spf-sub]. Each is set per form, with global defaults on an ACF options page [spf-acf-form], [spf-acf-opts].
- **Entries:**
  - Stored as `form_result` post meta on the form, if the form opts in.
  - The admin has a Submissions page with month filters, CSV export, and delete (all, by month range, or one entry) [spf-results].
- **Consent:** consent checkboxes ("opt-ins") with a default privacy text [spf-type].
- **Translations:**
  - FR `.po`/`.mo` files ship with the plugin [spf-lang].
  - A `wpml-config.xml` marks `form` as translatable, and Polylang reads that file [spf-wpml], [pll-wpml-config].

**What needs ACF PRO.** Only two pieces [spf-acf-form], [spf-acf-opts], [acf-pro]:

- the `opt_ins` **repeater**;
- the global settings, registered with `acf_add_options_sub_page`, an **options page**.

All the other per-form fields (text, email, textarea, wysiwyg, true/false, group) are ACF free field types. ACF free `^6.8` is already in `future`'s `wordpress/composer.json`.

## Verdicts at a glance

| Candidate | Version checked | Verdict | Decisive reason |
|---|---|---|---|
| **Baseline:** starterpack-forms without ACF PRO | 1.1.1 | **Recommended** | Meets the nine must-haves once ACF PRO is replaced and entry expiry is added. Smallest footprint. [spf-type], [spf-sub], [spf-results] |
| Contact Form 7 + Flamingo | 6.2.2 + 2.6.4 | **Shortlisted** | Everything is free. Public REST submit with field errors and server-side Turnstile. Tiny. But the form builder is a markup editor, not Gutenberg. [cf7-rest], [cf7-turnstile], [cf7-admin] |
| Forminator | 1.58.2 | **Shortlisted (runner-up)** | Every must-have is free. But it has no read API, no Polylang support, heavy upsells, and three critical unauthenticated advisories in 2026. [fmn-readme], [fmn-api], [fmn-vuln] |
| Fluent Forms | 6.2.16 | Eliminated | File Upload and auto-delete of entries are Pro. [ff-component], [ff-readme] |
| Formidable Forms Lite | 7.0 | Eliminated | File upload and section heading are Pro. The REST API and the Polylang add-on are paid. [frm-field], [frm-api-doc], [frm-pll] |
| Ninja Forms | 3.15.6 | Eliminated | File Uploads is a paid add-on. No public read or submit API. No Polylang support. [nf-upload], [nf-routes], [nf-pll] |
| WPForms Lite | 2.0.2.2 | Eliminated | Lite stores no entries in WordPress (no list, no CSV). File upload is Pro. [wpf-lite], [wpf-data], [wpf-file] |
| Jetpack Forms | Jetpack 16.3.1 (jetpack-forms 8.3.2) | Eliminated | No captcha or honeypot. File upload goes through WordPress.com behind a plan check. No confirmation email. Submitting needs a token found only in WP-rendered HTML. [jp-block], [jp-upload], [jp-form] |
| Kadence Blocks forms | 3.8.0.1 | Eliminated | "Database Entry" and "Auto Respond Email" are a Pro add-on: no entries, CSV or confirmation in free. [kb-actions] |
| Otter Blocks forms | 3.2.8 | Eliminated | CSV export, file upload and the autoresponder are Pro. No server-side validation of required fields. [ot-export], [ot-reg], [ot-server] |
| Existing WPGraphQL integrations | see below | Eliminated (as a category) | None is maintained for a free plugin. Ninja Forms' was last committed in 2021, Fluent Forms' is a one-day stub, WPForms' is single-author with no spam check. [nf-gql], [ff-gql], [wpf-gql] |

## Comparison: must-haves

✅ pass · 🟡 partial: a gap we could fill in the theme · ❌ fail · ❔ unverified. The column numbers are the must-haves listed under [Method](#method).

| Candidate (version) | 1 Free | 2 Editors build | 3 Headless | 4 Fields + server validation | 5 Spam | 6 Emails | 7 Entries + CSV | 8 Polylang | 9 GDPR |
|---|---|---|---|---|---|---|---|---|---|
| **Baseline** (1.1.1 without ACF PRO) | 🟡 Only once the repeater and options page are replaced [spf-acf-form], [spf-acf-opts] | ✅ Gutenberg `supt/input-*` blocks in a form CPT [spf-type] | ✅ GraphQL `form` type. Submits with a shared secret and gets JSON field errors [spf-type], [spf-sub] | ✅ All baseline types. Symfony validator returns field errors [spf-sub] | ✅ hCaptcha checked server-side. No honeypot [spf-sub] | 🟡 Notification and confirmation. "Send to" is a single ACF email field [spf-sub], [spf-acf-form] | ✅ Post meta, admin list, CSV [spf-results] | ✅ `form` CPT translatable through `wpml-config.xml`. FR `.po` [spf-wpml], [pll-wpml-config], [spf-lang] | 🟡 Consent opt-ins and manual delete. No expiry; uploaded files are kept after an entry is deleted [spf-results] |
| **CF7 + Flamingo** (6.2.2 + 2.6.4) | ✅ No Pro tier; both GPLv2+ [cf7-readme], [api-cf7] | 🟡 Classic markup editor with form-tags (`[text* name]`). The block only embeds a form [cf7-admin], [cf7-block] | 🟡 Public REST submit, no nonce, JSON `invalid_fields`. Reading a definition needs the `publish_pages` capability [cf7-rest], [cf7-sub] | 🟡 text, email, textarea, select, checkbox, radio, file, acceptance. No section-break tag: headings are HTML in the template [cf7-modules], [cf7-file] | ✅ Turnstile (token in the REST payload) and reCAPTCHA v3, checked server-side. No hCaptcha or honeypot [cf7-turnstile] | ✅ Mail plus optional "Mail (2)" to the submitter [cf7-sub] | 🟡 Needs Flamingo (free). CSV export. Files are not kept, only a hash [cf7-flamingo-mod], [fl-csv], [cf7-sub] | 🟡 One form per language, or the "Multilingual CF7 with Polylang" add-on, whose form translation is HTML-only [pll-cf7], [mcf7pll] | 🟡 `[acceptance]` field and erasers. Only spam entries expire (30 days) [cf7-acceptance], [fl-cron], [fl-privacy] |
| **Forminator** (1.58.2) | ✅ Uploads, captcha, retention and CSV are free. E-signature and Stripe subscriptions are Pro [fmn-readme] | 🟡 Own drag-and-drop builder. The block only embeds a form [fmn-block] | 🟡 No read API. Submits through admin-ajax with a nonce, which can be fetched publicly or switched off [fmn-api], [fmn-front] | ✅ All baseline types, including upload and section. Server-side required checks [fmn-readme], [fmn-front] | ✅ reCAPTCHA, hCaptcha, Turnstile and honeypot, checked server-side [fmn-captcha], [fmn-front] | ✅ Several notifications and an auto-response [fmn-readme] | ✅ Submissions list and CSV export [fmn-export] | ❌ No Polylang or WPML integration. Workaround: one form per language [fmn-wpml] | ✅ GDPR/consent fields, retention and auto-delete, erasers [fmn-gdpr] |
| Fluent Forms (6.2.16) | ❌ File Upload and auto-delete are Pro [ff-component], [ff-readme] | 🟡 Own builder. The block only embeds a form [ff-block] | 🟡 Every `fluentform/v1` REST route needs a capability. Admin-ajax submit without nonce, JSON errors (HTTP 423) [ff-routes], [ff-ajax], [ff-valid] | ❌ No file upload in free. Section break ✅ [ff-component] | ✅ reCAPTCHA, hCaptcha, Turnstile, honeypot [ff-valid], [ff-honeypot] | ✅ Notification and confirmation are free [ff-readme] | ✅ CSV, Excel, ODS, JSON export [ff-export] | 🟡 Official bridge is WPML-only. Polylang bridge is an unmaintained GitHub repo [ff-wpml], [ff-pll] | 🟡 GDPR field and manual delete. Auto-delete is Pro [ff-readme] |
| Formidable Lite (7.0) | ❌ Upload, section heading, REST API and Polylang are paid [frm-field], [frm-api-doc], [frm-pll] | 🟡 Own builder. The block only embeds a form [frm-blocks] | ❌ No REST API in Lite. Abilities API needs admin capabilities. Admin-ajax submit only [frm-app], [frm-ajax] | ❌ No `file` or `divider` field in Lite [frm-field] | ✅ Captcha field (reCAPTCHA, hCaptcha, Turnstile) and honeypot [frm-readme], [frm-validate] | ✅ Notifications and autoresponder [frm-readme] | ✅ Entries and CSV [frm-hooks] | ❌ Paid add-on [frm-pll] | 🟡 GDPR field. Expiry ❔ [frm-gdpr] |
| Ninja Forms (3.15.6) | ❌ File Uploads costs $49/yr [nf-upload] | 🟡 Own builder. The block only embeds a form [nf-readme] | ❌ REST routes cover submissions only and need a capability. Admin-ajax submit with nonce [nf-routes], [nf-submit] | ❌ No file upload in free [nf-upload] | ✅ Turnstile, hCaptcha, reCAPTCHA checked server-side. Honeypot ❔ [nf-turnstile] | ✅ Notifications to many recipients [nf-readme] | ✅ CSV export is free [nf-readme] | ❌ No support; WPML only [nf-pll] | 🟡 Free expiry cron and erasers. No consent field (a checkbox would do) [nf-expiry] |
| WPForms Lite (2.0.2.2) | ❌ Entries, CSV, file upload are Pro [wpf-lite] | 🟡 Own builder. The block only embeds a form [wpf-readme] | ❌ No REST API. Admin-ajax submit [wpf-process] | ❌ File upload and divider are Pro [wpf-file] | ✅ hCaptcha, reCAPTCHA, Turnstile, honeypot [wpf-process] | 🟡 One notification in Lite. Confirmation email ❔ [wpf-lite] | ❌ Entries go to the WPForms cloud ("Lite Connect") and come back only with Pro [wpf-lite], [wpf-data] | ❌ WPML only ❔ [wpf-wpml] | 🟡 GDPR checkbox. No entries to delete [wpf-gdpr] |
| Jetpack Forms (16.3.1 / 8.3.2) | ❌ File upload needs WordPress.com and a plan [jp-block], [jp-upload] | ✅ Gutenberg `jetpack/contact-form` with field blocks [jp-block] | ❌ Admin-ajax submit needs a form hash and a JWT found only in rendered HTML. A single error message [jp-plugin], [jp-form] | 🟡 All basic types. File upload is paid. No heading field [jp-block] | ❌ Akismet only. No captcha or honeypot [jp-plugin] | 🟡 Notification only. No confirmation email [jp-form] | ✅ `feedback` CPT and CSV export [jp-plugin] | ❔ No statement [jp-form] | 🟡 Consent field and erasers. No expiry [jp-plugin] |
| Kadence Blocks (3.8.0.1) | ❌ Entries and autoresponder are a Pro add-on [kb-actions] | ✅ Gutenberg advanced-form blocks in a `kadence_form` CPT [kb-cpt] | 🟡 Admin-ajax submit, JSON `fieldErrors`, no nonce by default. Reading needs `edit_post` [kb-ajax], [kb-rest] | 🟡 Free file upload. No heading field [kb-ajax] | ✅ Turnstile, hCaptcha, reCAPTCHA checked server-side [kb-ajax], [kb-captcha-verify] | 🟡 Admin email only. Autoresponder is Pro [kb-actions] | ❌ No entries in free [kb-actions] | ❔ No statement | 🟡 Accept field. No entries [kb-actions] |
| Otter Blocks (3.2.8) | ❌ CSV export, file upload, autoresponder are Pro [ot-export], [ot-reg] | ✅ Gutenberg `themeisle-blocks/form` [ot-reg] | 🟡 REST submit needs two WordPress nonces. No per-field errors [ot-server] | ❌ No file upload. No server-side required check [ot-reg], [ot-server] | ✅ Turnstile or reCAPTCHA checked server-side, plus a client-set honeypot [ot-server] | 🟡 Admin email only. Autoresponder is Pro [ot-reg] | 🟡 Stored as `otter_form_record`. CSV is Pro [ot-subs], [ot-export] | ❔ No statement | 🟡 No consent field. Manual delete only [ot-server] |

## Comparison: bloat

Zip sizes come from HEAD requests on the WordPress.org download links (2026-10-20) [api-*]. The baseline's size is its GitHub release asset [spf-release].

| Candidate (version) | Zip size | Custom DB tables | Admin menus / upsell nags | Front-end assets not needed headless | SaaS account | Add-ons for the must-haves |
|---|---|---|---|---|---|---|
| **Baseline** (1.1.1) | 0.9 MB, including Symfony validator and mime [spf-release], [spf-composer] | None: CPT and post meta [spf-type], [spf-results] | One "Forms" menu: Settings, Submissions. No nags [spf-type], [spf-results] | None on the front end. Admin CSS/JS on its own screens only [spf-type], [spf-results] | hCaptcha (free tier) for spam [spf-sub] | ACF PRO today. 0 once the PRO fields are replaced |
| **CF7** (6.2.2) + **Flamingo** (2.6.4) | 0.37 MB + 0.04 MB [api-cf7], [api-flamingo] | None. CPTs `wpcf7_contact_form`, `flamingo_inbound`, `flamingo_contact` [cf7-cpt], [fl-inbound] | "Contact" and "Flamingo" menus. The CF7 Dashboard shows a contactform7.com RSS news widget and a "private support" link. No upgrade menu [cf7-admin], [cf7-dash], [fl-admin] | CF7 JS/CSS on WP pages. Can be turned off with `WPCF7_LOAD_JS` / `WPCF7_LOAD_CSS`. Not needed to submit [cf7-controller] | None. Turnstile needs a free Cloudflare key [cf7-turnstile] | 1 (Flamingo, free). Plus 1 optional for Polylang [mcf7pll] |
| **Forminator** (1.58.2) | 11.4 MB [api-forminator] | 4: `frmt_form_entry`, `frmt_form_entry_meta`, `frmt_form_views`, `frmt_form_reports`, plus Action Scheduler tables [fmn-tables] | Top-level menu with "Get Forminator Pro" and cross-sell submenus. Rating, Pro, Hub-connect and recommended-plugin notices. Deactivation survey [fmn-admin] | Loaded where WordPress renders a form. Not needed to submit [fmn-front] | WPMU DEV Hub only for cloud templates. Mixpanel tracking is opt-in [fmn-hub], [fmn-core] | 0. Nothing exists for Polylang [fmn-wpml] |
| Fluent Forms (6.2.16) | 10.7 MB [api-fluentform] | 8, plus 3 for payments [ff-migrations] | Top-level menu, dashboard widget, review notices. Pro fields shown disabled with upgrade text [ff-menu], [ff-component] | Only on pages with a form [ff-block] | None [ff-readme] | Fluent Forms Pro (paid) |
| Formidable Lite (7.0) | 5.7 MB [api-formidable] | 7: `frm_forms`, `frm_fields`, `frm_items`, `frm_item_metas`, `frm_gated_tokens`, `frm_payments`, `frm_subscriptions` [frm-migrate], [frm-trans] | Top-level menu with an "Upgrade" submenu, plus upgrade CTAs [frm-addons] | `formidable.min.js` where a form renders | Weekly usage cron [frm-cron] | Pro, the API add-on and the Polylang add-on (Business plan) |
| Ninja Forms (3.15.6) | 6.9 MB [api-ninja-forms] | 11 `nf3_*` tables [nf-migrations] | Top-level menu with an "Add-Ons" upsell submenu [nf-addons] | jQuery, Backbone and front-end bundles [nf-render] | None | File Uploads ($49/yr). Polylang: none exists |
| WPForms Lite (2.0.2.2) | 13.7 MB [api-wpforms-lite] | 8 or more (payments, logs, analytics, tasks), plus Action Scheduler [wpf-db] | "Upgrade to Pro" in the menu and the admin bar, dashboard widget, sample-only Entries page [wpf-lite] | `wpforms.min.js` and others | Entries depend on Lite Connect (cloud) [wpf-lite] | WPForms Pro |
| Jetpack Forms (16.3.1) | 30.0 MB [api-jetpack] | Forms package: none. Jetpack adds `jetpack_sync_queue`, `jetpack_waf_blocklog` [jp-sync], [jp-waf] | Jetpack menu, My Jetpack product cards, connection notices [jp-changelog] | Form scripts and CSS. Submitting needs rendered hidden fields [jp-form] | WordPress.com for uploads and Drive export. Akismet key for spam [jp-upload] | Akismet, plus custom code |
| Kadence Blocks (3.8.0.1) | 13.1 MB [api-kadence-blocks] | 4 (`kb_optimizer*`, `kb_design_tokens*`) [kb-tables] | "Kadence" menu, "Upgrade" link, announcement banner [kb-settings] | `kb-advanced-form-block.min.js`. Not needed to submit | None for forms | Kadence Blocks Pro |
| Otter Blocks (3.2.8) | 7.8 MB [api-otter-blocks] | None found [ot-subs] | Top-level menu, dashboard widget, upsell and limited-offer notices, SDK survey [ot-dash], [ot-pro] | Form view script where the block is present [ot-reg] | None | Otter Pro |

## Comparison: health

Last release, installs and support threads come from the WordPress.org API, read 2026-10-20 [api-*]. "Support" is threads resolved in the last two months.

| Candidate (version) | Last release | Active installs | Releases, last 12 months | Advisories, last 2 years (worst) | Support | Licence | Other |
|---|---|---|---|---|---|---|---|
| **Baseline** (1.1.1) | 2024-12-10 [spf-releases] | In-house | 0 (20 releases from 2023-01 to 2024-12) [spf-releases] | None published. The chunked upload handler needs hardening before it ships on `future` [spf-sub] | In-house | GPL-3.0-or-later [spf-readme] | We own all of its maintenance |
| **CF7** (6.2.2) | 2026-10-11 | 10,000,000+ | 8 [gh-cf7-rel] | 1, Medium 5.3 ("Order Replay" < 6.0.6) [wpscan-cf7] | 30/80 | GPLv2+ | 6.2.x **requires WordPress 7.1**. `future` runs 6.9 (`wordpress/Dockerfile`), so pin 6.1.7 (WP 6.7+) or upgrade [api-cf7], [cf7-617] |
| **Flamingo** (2.6.4) | 2026-08-18 | 800,000+ | 4 [gh-fl-rel] | 1, Low 2.7 [wpscan-fl] | 1/1 | GPLv2+ | Same vendor as CF7 (Rock Lobster Inc.), one developer in practice |
| **Forminator** (1.58.2) | 2026-10-14 | 600,000+ | ~41 (9 on 2026-08-18) [fmn-readme] | 42 [fmn-vuln]. Worst **Critical 9.8**: unauthenticated file upload (CVE-2026-15748) and object injection (CVE-2026-66583), plus Critical 9.1 shortcode execution (CVE-2026-92229). Two more unauthenticated shortcode executions are Medium 6.5 (CVE-2026-101335, CVE-2026-103911) | 56/69 | GPL v3 | WPMU DEV / Incsub |
| Fluent Forms (6.2.16) | 2026-10-16 | 800,000+ | 32 [ff-readme] | 25 [ff-vuln]. Worst High 8.2 (authorization bypass) | 12/12 | GPLv2+ | WPManageNinja |
| Formidable Lite (7.0) | 2026-10-16 | 300,000+ | 15 [frm-svn-log] | 6 [frm-vuln]. Worst High 7.2 (unauthenticated stored XSS) | 1/1 | GPL v2 | Strategy11 |
| Ninja Forms (3.15.6) | 2026-10-15 | 500,000+ | 34 tags (25 mainline) [nf-svn-log] | 26 [nf-vuln]. Worst **Critical 9.3** | 7/11 | GPLv2+ | Saturday Drive |
| WPForms Lite (2.0.2.2) | 2026-10-06 | 5,000,000+ | 23 [wpf-svn-log] | 19 [wpf-vuln]. Worst High 8.1 (CSRF) | 17/20 | GPLv2+ | Awesome Motive |
| Jetpack (16.3.1) | 2026-10-12 | 3,000,000+ | 19 [jp-changelog] | 8 [jp-patchstack]. Worst seen 6.5 | 43/53 | GPLv2+ | Automattic. Requires WordPress 7.0 [api-jetpack] |
| Kadence Blocks (3.8.0.1) | 2026-10-19 | 600,000+ | 36 [kb-readme] | 26 [kb-patchstack]. Worst seen 6.5 | 6/15 | GPLv2+ | StellarWP |
| Otter Blocks (3.2.8) | 2026-10-19 | 300,000+ | 18 [ot-releases] | 9 [ot-patchstack]. Worst seen 5.3 | 5/5 | GPLv2+ | Themeisle |

## Eliminated candidates

Each one fails at least one must-have that we can't fill in the theme at a reasonable cost.

- **Fluent Forms 6.2.16**
  - File Upload is disabled in the free builder ("File Upload is not available with the free version") [ff-component].
  - The readme's Pro list includes "File Upload" and "Auto-delete entries" [ff-readme].
  - The free build has an `input_file` element definition but no upload handler. Filling the gap would mean building an unsupported Pro feature ourselves.
  - Otherwise it is the cleanest of the big builders: admin-ajax submit with no nonce, JSON field errors, free Turnstile and honeypot.
- **Formidable Forms Lite 7.0**
  - `file` and `divider` are in `pro_field_selection()` [frm-field].
  - The REST API is the paid "Formidable API" add-on (Business licence) [frm-api-doc].
  - The Polylang add-on needs Business plus Pro [frm-pll].
- **Ninja Forms 3.15.6**
  - File Uploads is a paid add-on ($49/yr) [nf-upload].
  - The only REST namespace serves submissions to logged-in users [nf-routes].
  - No Polylang support [nf-pll].
  - 26 advisories in two years, two of them Critical [nf-vuln].
- **WPForms Lite 2.0.2.2**
  - Lite doesn't store entries in WordPress: "Since entries are not stored in WPForms Lite…" [wpf-lite], [wpf-data].
  - File upload is a Pro field [wpf-file].
- **Jetpack Forms** (Jetpack 16.3.1)
  - No standalone plugin exists [api-jetpack-forms].
  - The file field has a plan check and stores files on WordPress.com [jp-block], [jp-upload].
  - Spam checking is Akismet only [jp-plugin].
  - No confirmation email [jp-form].
  - Submitting needs a `contact-form-hash` and a JWT that only WP-rendered HTML contains [jp-plugin], [jp-form].
  - 30 MB, and Jetpack requires WordPress 7.0 [api-jetpack].
- **Kadence Blocks 3.8.0.1**
  - "Database Entry (Pro addon)" and "Auto Respond Email (Pro addon)" are disabled in free [kb-actions].
  - Its submit API is otherwise good: JSON `fieldErrors` and server-side captcha [kb-ajax].
  - Watch out: per-block captcha secret keys are stored in block attributes [kb-captcha].
- **Otter Blocks 3.2.8**
  - Exporting submissions dies with "Exporting submissions requires Otter Pro." [ot-export].
  - File upload and the autoresponder live in `plugins/otter-pro`, which the WordPress.org build doesn't ship [ot-reg].
  - The server trusts the client's field list and doesn't check required fields [ot-server].
- **Existing WPGraphQL integrations**
  - None is maintained for a free plugin [wpgql-ext], [wpgql-registry]:
    - `toriphes/wp-graphql-ninja-forms`: last commit 2021-09-24; its maintainer calls it "not production ready" [nf-gql].
    - `FullStackIndustries/wp-graphql-fluent-forms`: four commits on 2024-05-30, query only [ff-gql].
    - `dazza-dev/sw-wpforms-graphql`: one file, no spam check, 0 stars [wpf-gql].
  - Nothing exists for CF7, Forminator, Formidable, Jetpack, Kadence or Otter.
  - The only maintained form extension, WPGraphQL for Gravity Forms, is for a paid plugin, so it is only a reference point [gf-gql].
  - Whichever option we pick, the form definition will go through our own small GraphQL field.

## Shortlist, costed for this stack

Each option is costed against `future`:

- **WordPress side:** the WPGraphQL 2.x, wp-graphql-gutenberg and Polylang setup in `wordpress/composer.json`.
- **Next side:** Next 16, where every block renders through `next/src/components`. Forms would follow [Option B](../blocks/create-block.md) of the block docs.

`future` has no form code at all. Whatever we pick, these are new work:

- a Next renderer for the fields;
- a submission route;
- a spam widget.

Day counts are rough estimates for one developer, for comparison only.

### Baseline: starterpack-forms without ACF PRO

- **WordPress (plugin):**
  - Replace the `opt_ins` repeater with consent blocks in the form. A `supt/checkbox` block is already in the plugin's allowed list [spf-type].
  - Replace the ACF options page with a core Settings API page under Forms.
  - Keep the per-form ACF free field group, or move it to `register_post_meta` plus a `PluginDocumentSettingPanel` to drop ACF from the plugin entirely.
  - Add an entry-retention setting with a WP-cron purge that also deletes the entry's uploaded files.
  - Allow several recipients.
  - Read the secret from a header instead of the query string.
  - Harden the chunked upload handler.
  - ~3–4 days.
- **Blocks in WordPress:** port the 10 `supt/input-*` blocks and the `supt/form` block from `main`'s `src/components` (about 100 KB of TSX/CSS) to `wordpress/theme/src/blocks`. ~2 days.
- **Blocks in Next:**
  - Port `Form` and the input atoms to `next/src/components/custom` and register them in `next/src/components/data.ts`.
  - Add `react-hook-form` and `@hcaptcha/react-hcaptcha`, which `main` already uses [main-form].
  - Regenerate the GraphQL types.
  - ~2–3 days.
- **Submission route:** a route handler, e.g. `next/src/app/api/forms/route.ts`, replaces the two `next.config.js` rewrites. It forwards the multipart body to WordPress with the secret in a header, and uses `secret-matches` as the revalidate route does. ~1 day.
- **Spam:**
  - hCaptcha as today. Turnstile could be added as a second provider.
  - A honeypot is cheap to add in the same validation step.
  - ~0.5 day.
- **Environment variables:**
  - `WORDPRESS_FORMS_SECRET` (Next and WordPress).
  - `WORDPRESS_HCAPTCHA_SECRET` (WordPress, set by `provision.sh` on `main`).
  - `NEXT_PUBLIC_HCAPTCHA_KEY` (Next).
  - Add them to `next/.env.example` and to `future`'s provisioning.
- **Migration from starterpack-forms on `main`:**
  - Same CPT, block names and entry meta, so forms and entries carry over.
  - One theme DB migration (`wordpress/theme/migrations`) turns the ACF `opt_ins` rows into consent blocks and moves the ACF option values to the new option names.
- **Total: ~9–11 days.** Leaves us owning a small plugin.

### Contact Form 7 + Flamingo

- **WordPress:**
  - `composer require wpackagist-plugin/contact-form-7:~6.1.7 wpackagist-plugin/flamingo`. The pin is because 6.2.x needs WordPress 7.1 [cf7-617].
  - A theme WPGraphQL field `contactForm(id)` that returns `scan_form_tags()` and the template. The REST read route needs `publish_pages` [cf7-rest].
  - A `wpcf7_remote_ip_addr` filter that trusts a header set by Next. Without it, every entry and spam check sees the Next server's IP [cf7-sub].
  - A WP-cron purge of old `flamingo_inbound` posts.
  - `WPCF7_LOAD_JS` / `WPCF7_LOAD_CSS` set to false.
  - ~2 days.
- **Blocks in Next:**
  - A component for `contact-form-7/contact-form-selector`, which only carries the form id [cf7-block].
  - A parser that turns the CF7 template (form-tags plus HTML labels and headings) into fields, rendered with the same input atoms as the baseline.
  - ~4–5 days.
- **Submission route:**
  - A route handler posts `multipart/form-data` to `/wp-json/contact-form-7/v1/contact-forms/<id>/feedback`, with a generated `_wpcf7_unit_tag` and a User-Agent.
  - It maps `invalid_fields[]` to field errors. Note that `acceptance_missing` comes back without a field entry [cf7-rest], [cf7-sub].
  - The endpoint is public, so no shared secret.
  - ~1 day.
- **Spam:**
  - CF7's built-in Turnstile, with the token sent as `_wpcf7_turnstile_response` [cf7-turnstile].
  - Once Turnstile is on, it applies to every form.
  - ~0.5 day.
- **Environment variables:**
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (Next).
  - The Turnstile secret is stored in CF7's Integration settings (a WordPress option), set at provisioning.
- **Migration from starterpack-forms:**
  - Rewrite each form in CF7 tag syntax and move its mail settings.
  - A DB migration swaps `supt/form` blocks for the CF7 selector block.
  - Entries stay in the old meta.
  - ~1–2 days, plus editor training.
- **Total: ~9–11 days.**
- **What we lose:**
  - the Gutenberg builder;
  - stored uploaded files (Flamingo keeps a hash only);
  - per-entry deletion and expiry, unless we add the purge cron;
  - translated forms, unless we keep one form per language.

### Forminator (runner-up)

- **WordPress:**
  - `composer require wpackagist-plugin/forminator`.
  - A theme WPGraphQL resolver over `Forminator_API::get_form_fields()` / `get_form_wrappers()` [fmn-api].
  - A `forminator_user_ip` filter.
  - Usage tracking off (`forminator_usage_tracking_disabled`).
  - Check whether wp-graphql-gutenberg sees the `forminator/forms` block, which is registered only in the admin (❔) [fmn-block].
  - ~2 days.
- **Blocks in Next:** a renderer for Forminator's field schema (wrappers, element ids like `name-1`). ~4 days.
- **Submission route:**
  - A route handler proxies admin-ajax `forminator_submit_form_custom-forms`.
  - It either fetches a nonce from `forminator_get_nonce` first, or the nonce check is turned off with `forminator_is_force_validate_submissions_nonce`.
  - It maps `errors[]` to fields.
  - [fmn-front]. ~1 day.
- **Spam:** hCaptcha or Turnstile configured in Forminator, with the token sent as `h-captcha-response` / `forminator-turnstile-response` [fmn-front]. ~0.5 day.
- **Environment variables:** `NEXT_PUBLIC_HCAPTCHA_KEY` (Next). The secret lives in Forminator's settings (a WordPress option).
- **Migration from starterpack-forms:** rebuild every form in Forminator's builder, then a DB migration swaps the blocks. ~1–2 days.
- **Total: ~9–11 days, plus ongoing security patching.**
  - It has had three critical unauthenticated advisories in 2026 [fmn-vuln].
  - It has no Polylang story [fmn-wpml].

## Recommendation

**Keep starterpack-forms, remove its ACF PRO dependency and port it to `future`.**

Why:

- **Same integration work.** All three shortlisted options cost about the same to integrate (~9–11 days), because `future` needs a field renderer, a submission route and a spam widget whichever we pick. A third-party plugin doesn't save that work. It only changes what the renderer has to parse.
- **The baseline fits our stack best:**
  - It is the only option where editors build forms with Gutenberg blocks, the way they edit pages.
  - Its GraphQL form definition is ours.
  - It keeps uploaded files.
  - It translates through the Polylang setup we already run.
  - It adds no DB tables, upsells, front-end assets or SaaS dependency beyond hCaptcha.
- **The runner-ups each lose something real:**
  - CF7 + Flamingo is the leanest plugin, but it moves editors to a markup editor and drops stored files and translated forms.
  - Forminator covers every must-have, but adds an 11 MB plugin, four tables, upsell notices, no Polylang support and a 2026 run of critical advisories.

**Trade-offs we accept:**

- **We own the maintenance and the security** of a small plugin. There is no community and no third-party patch stream. Its upload path in particular needs hardening as part of this work.
- **Less in the box.** We get no form features beyond the must-haves (conditional logic, multi-step, payments, integrations) unless we build them.
- **Different place, different version.** The input blocks move from `main`'s shared `src/components` into `future`'s split theme/Next layout, so the plugin version for `future` differs from the one `main` pins.

**What the recommendation does not cover from today's baseline:**

- **ACF PRO for global defaults.**
  - The global "send to / send from / messages / autoreply" defaults move from the ACF options page to a core Settings API page.
  - The opt-ins repeater becomes consent blocks inside the form.
  - Existing data needs the migration described above.
- **Rewrites.** The `next.config.js` rewrites for `/api/submit-form/` and `/api/submit-form/upload/` are replaced by a route handler. The secret no longer travels in the query string.
- **Existing projects' submissions.** They are not migrated (out of scope for #261). The entry storage format stays the same, so no conversion is needed.
- **Not new features.** Conditional logic, multi-step forms, payment fields and CRM integrations aren't in the baseline today, and this plan doesn't add them.

## Open questions for the team

1. **Is hCaptcha still the spam provider?** Or do we switch to Turnstile, or offer both, and add a honeypot? This decides the environment variables and which client package Next needs.
2. **Should forms be per language or shared?** Do we translate whole forms per language (the `form` CPT through Polylang, as today), or keep one form with translated labels?
3. **How long are entries kept?**
   - What default retention should the purge use, and is it set per form or globally?
   - Should uploaded files stay in the public uploads folder, or move to a private folder served only to admins?
4. **Settings in ACF free or core?** Do we keep the per-form settings in an ACF free field group (fast), or move them to core post meta and a block-editor sidebar so the plugin has no ACF dependency at all (cleaner, ~1 more day)?
5. **One repo or two branches?** Do we release a v2 of starterpack-forms for `future` from the same repo, or move the plugin into this monorepo (`wordpress/`) next to the theme?
6. **When does WordPress 7.1 come?** It matters if the team prefers CF7 after all. CF7 6.2.x and Jetpack require it, and `future` runs 6.9.
7. **Does forms block the `future` release?** Can v2 ship without forms, as the issue assumes, or is this a release blocker?

## Sources

Read 2026-10-20. Path prefixes:

- WordPress.org plugin code: `https://plugins.svn.wordpress.org/<slug>/tags/<version>/<path>`. The same tree is at `https://plugins.trac.wordpress.org/browser/<slug>/tags/<version>/<path>`.
- WordPress.org API: `https://api.wordpress.org/plugins/info/1.2/?action=plugin_information&request[slug]=<slug>`.

### WordPress.org API (version, last update, installs, support, requirements, zip link)

- [api-cf7]: https://api.wordpress.org/plugins/info/1.2/?action=plugin_information&request%5Bslug%5D=contact-form-7 (6.2.2)
- [api-flamingo]: https://api.wordpress.org/plugins/info/1.2/?action=plugin_information&request%5Bslug%5D=flamingo (2.6.4)
- [api-forminator]: https://api.wordpress.org/plugins/info/1.2/?action=plugin_information&request%5Bslug%5D=forminator (1.58.2)
- [api-fluentform]: https://api.wordpress.org/plugins/info/1.2/?action=plugin_information&request%5Bslug%5D=fluentform (6.2.16)
- [api-formidable]: https://api.wordpress.org/plugins/info/1.2/?action=plugin_information&request%5Bslug%5D=formidable (7.0)
- [api-ninja-forms]: https://api.wordpress.org/plugins/info/1.2/?action=plugin_information&request%5Bslug%5D=ninja-forms (3.15.6)
- [api-wpforms-lite]: https://api.wordpress.org/plugins/info/1.2/?action=plugin_information&request%5Bslug%5D=wpforms-lite (2.0.2.2)
- [api-jetpack]: https://api.wordpress.org/plugins/info/1.2/?action=plugin_information&request%5Bslug%5D=jetpack (16.3.1, requires WP 7.0)
- [api-jetpack-forms]: https://api.wordpress.org/plugins/info/1.2/?action=plugin_information&request%5Bslug%5D=jetpack-forms ("Plugin not found")
- [api-kadence-blocks]: https://api.wordpress.org/plugins/info/1.2/?action=plugin_information&request%5Bslug%5D=kadence-blocks (3.8.0.1)
- [api-otter-blocks]: https://api.wordpress.org/plugins/info/1.2/?action=plugin_information&request%5Bslug%5D=otter-blocks (3.2.8)

### Baseline: starterpack-forms v1.1.1 and superstack `main`

- [spf-type]: https://github.com/superhuit-agency/starterpack-forms/blob/v1.1.1/form-type.php
- [spf-sub]: https://github.com/superhuit-agency/starterpack-forms/blob/v1.1.1/submission.php
- [spf-results]: https://github.com/superhuit-agency/starterpack-forms/blob/v1.1.1/result-list.php
- [spf-acf-form]: https://github.com/superhuit-agency/starterpack-forms/blob/v1.1.1/acf-json/group_5ce564730cfe4.json ("Form options": `opt_ins` is a repeater)
- [spf-acf-opts]: https://github.com/superhuit-agency/starterpack-forms/blob/v1.1.1/acf-json/group_5ce6aa151d4b5.json ("Forms configuration", on the options page)
- [spf-wpml]: https://github.com/superhuit-agency/starterpack-forms/blob/v1.1.1/wpml-config.xml
- [spf-lang]: https://github.com/superhuit-agency/starterpack-forms/tree/v1.1.1/languages
- [spf-readme]: https://github.com/superhuit-agency/starterpack-forms/blob/v1.1.1/readme.txt
- [spf-composer]: https://github.com/superhuit-agency/starterpack-forms/blob/v1.1.1/composer.json
- [spf-release]: https://github.com/superhuit-agency/starterpack-forms/releases/download/v1.1.1/starterpack-forms-v1.1.1.zip (897,510 bytes)
- [spf-releases]: https://github.com/superhuit-agency/starterpack-forms/releases
- [main-form]: https://github.com/superhuit-agency/superstack/blob/main/src/components/molecules/Form/index.tsx
- [main-next]: https://github.com/superhuit-agency/superstack/blob/main/next.config.js
- [acf-pro]: https://www.advancedcustomfields.com/pro/ (Repeater and Options Pages are PRO features)
- [pll-wpml-config]: https://polylang.pro/documentation/support/developers/the-wpml-config-xml-file/

### Contact Form 7 6.2.2 and Flamingo 2.6.4

- [cf7-rest]: `contact-form-7/tags/6.2.2/includes/rest-api.php`
- [cf7-sub]: `contact-form-7/tags/6.2.2/includes/submission.php`
- [cf7-cpt]: `contact-form-7/tags/6.2.2/includes/contact-form.php`
- [cf7-file]: `contact-form-7/tags/6.2.2/includes/file.php`
- [cf7-modules]: `contact-form-7/tags/6.2.2/modules/`
- [cf7-turnstile]: `contact-form-7/tags/6.2.2/modules/turnstile/turnstile.php` and `service.php`
- [cf7-acceptance]: `contact-form-7/tags/6.2.2/modules/acceptance.php`
- [cf7-flamingo-mod]: `contact-form-7/tags/6.2.2/modules/flamingo.php`
- [cf7-block]: `contact-form-7/tags/6.2.2/includes/block-editor/block.json`
- [cf7-admin]: `contact-form-7/tags/6.2.2/admin/admin.php`
- [cf7-dash]: `contact-form-7/tags/6.2.2/admin/includes/dashboard.php`
- [cf7-controller]: `contact-form-7/tags/6.2.2/includes/controller.php`
- [cf7-readme]: `contact-form-7/tags/6.2.2/readme.txt`
- [cf7-617]: `contact-form-7/tags/6.1.7/readme.txt` (requires WP 6.7, PHP 7.4)
- [fl-admin]: `flamingo/tags/2.6.4/admin/admin.php`
- [fl-csv]: `flamingo/tags/2.6.4/includes/csv.php`
- [fl-cron]: `flamingo/tags/2.6.4/includes/cron.php`
- [fl-privacy]: `flamingo/tags/2.6.4/admin/includes/privacy.php`
- [fl-inbound]: `flamingo/tags/2.6.4/includes/class-inbound-message.php`
- [gh-cf7-rel]: https://github.com/rocklobster-in/contact-form-7/releases
- [gh-fl-rel]: https://github.com/rocklobster-in/flamingo/releases
- [wpscan-cf7]: https://wpscan.com/plugin/contact-form-7/ (also https://patchstack.com/database/wordpress/plugin/contact-form-7)
- [wpscan-fl]: https://wpscan.com/plugin/flamingo/
- [pll-cf7]: https://polylang.pro/how-to-translate-contact-forms-with-polylang/ (2023-11-21)
- [mcf7pll]: https://wordpress.org/plugins/multilingual-contact-form-7-with-polylang/ (1.0.13)

### Forminator 1.58.2

- [fmn-readme]: `forminator/tags/1.58.2/readme.txt`
- [fmn-api]: `forminator/tags/1.58.2/library/class-api.php`
- [fmn-front]: `forminator/tags/1.58.2/library/abstracts/abstract-class-front-action.php`
- [fmn-captcha]: `forminator/tags/1.58.2/library/class-captcha-verification.php`
- [fmn-tables]: `forminator/tags/1.58.2/library/class-database-tables.php`
- [fmn-export]: `forminator/tags/1.58.2/library/class-export.php`
- [fmn-gdpr]: `forminator/tags/1.58.2/library/abstracts/abstract-class-general-data-protection.php`
- [fmn-admin]: `forminator/tags/1.58.2/admin/classes/class-admin.php`
- [fmn-hub]: `forminator/tags/1.58.2/library/class-forminator-hub-connector.php`
- [fmn-core]: `forminator/tags/1.58.2/library/class-core.php`
- [fmn-block]: `forminator/tags/1.58.2/addons/pro/gutenberg/library/class-forminator-gfblock-abstract.php`
- [fmn-wpml]: https://wpml.org/plugin/forminator/ ("does not contain a WPML integration at the moment")
- [fmn-vuln]: https://www.wpvulnerability.net/plugin/forminator/ (also https://patchstack.com/database/wordpress/plugin/forminator)

### Fluent Forms 6.2.16

- [ff-readme]: `fluentform/tags/6.2.16/readme.txt`
- [ff-component]: `fluentform/tags/6.2.16/app/Modules/Component/Component.php`
- [ff-block]: `fluentform/tags/6.2.16/app/Services/Blocks/GutenbergBlock.php`
- [ff-routes]: `fluentform/tags/6.2.16/app/Http/Routes/api.php` and `app/Http/Policies/`
- [ff-ajax]: `fluentform/tags/6.2.16/app/Hooks/Ajax.php`
- [ff-valid]: `fluentform/tags/6.2.16/app/Services/Form/FormValidationService.php`
- [ff-honeypot]: `fluentform/tags/6.2.16/app/Modules/Form/HoneyPot.php`
- [ff-export]: `fluentform/tags/6.2.16/app/Modules/Entries/Export.php`
- [ff-migrations]: `fluentform/tags/6.2.16/database/Migrations/` and `app/Modules/Payments/Migrations/Migration.php`
- [ff-menu]: `fluentform/tags/6.2.16/app/Modules/Registerer/Menu.php`
- [ff-wpml]: https://fluentforms.com/multilingual-forms-for-fluent-forms-with-wpml/
- [ff-pll]: https://github.com/sixmonkey/multilingual-forms-fluent-forms-polylang (0 stars, last commit 2026-05-21)
- [ff-vuln]: https://www.wpvulnerability.net/plugin/fluentform/ (also https://patchstack.com/database/wordpress/plugin/fluentform)

### Formidable Forms 7.0

- [frm-readme]: `formidable/tags/7.0/readme.txt`
- [frm-field]: `formidable/tags/7.0/classes/models/FrmField.php`
- [frm-app]: `formidable/tags/7.0/classes/controllers/FrmAppController.php` and `classes/helpers/FrmAbilitiesHelper.php`
- [frm-ajax]: `formidable/tags/7.0/classes/controllers/FrmEntriesAJAXSubmitController.php`
- [frm-validate]: `formidable/tags/7.0/classes/models/FrmEntryValidate.php`
- [frm-hooks]: `formidable/tags/7.0/classes/controllers/FrmHooksController.php`
- [frm-gdpr]: `formidable/tags/7.0/classes/helpers/FrmFieldGdprHelper.php`
- [frm-cron]: `formidable/tags/7.0/classes/controllers/FrmCronController.php`
- [frm-blocks]: `formidable/tags/7.0/classes/controllers/FrmSimpleBlocksController.php`
- [frm-migrate]: `formidable/tags/7.0/classes/models/FrmMigrate.php`
- [frm-trans]: `formidable/tags/7.0/stripe/models/FrmTransLiteDb.php`
- [frm-addons]: `formidable/tags/7.0/classes/controllers/FrmAddonsController.php`
- [frm-svn-log]: https://plugins.trac.wordpress.org/log/formidable/tags
- [frm-api-doc]: https://formidableforms.com/knowledgebase/formidable-api/
- [frm-pll]: https://formidableforms.com/knowledgebase/polylang/
- [frm-vuln]: https://www.wpvulnerability.net/plugin/formidable/ (also https://patchstack.com/database/wordpress/plugin/formidable)

### Ninja Forms 3.15.6

- [nf-readme]: `ninja-forms/tags/3.15.6/readme.txt`
- [nf-routes]: `ninja-forms/tags/3.15.6/includes/Routes/Submissions.php`
- [nf-submit]: `ninja-forms/tags/3.15.6/includes/AJAX/Controllers/Submission.php`
- [nf-turnstile]: `ninja-forms/tags/3.15.6/includes/Fields/Turnstile.php`
- [nf-expiry]: `ninja-forms/tags/3.15.6/includes/Database/SubmissionExpirationCron.php`
- [nf-migrations]: `ninja-forms/tags/3.15.6/includes/Database/Migrations/`
- [nf-addons]: `ninja-forms/tags/3.15.6/includes/Admin/Menus/Addons.php`
- [nf-render]: `ninja-forms/tags/3.15.6/includes/Display/Render.php`
- [nf-svn-log]: https://plugins.trac.wordpress.org/log/ninja-forms/tags
- [nf-upload]: https://ninjaforms.com/extensions/file-uploads/
- [nf-pll]: https://wordpress.org/support/?p=13527666
- [nf-vuln]: https://www.wpvulnerability.net/plugin/ninja-forms/ (also https://patchstack.com/database/wordpress/plugin/ninja-forms)

### WPForms Lite 2.0.2.2

- [wpf-readme]: `wpforms-lite/tags/2.0.2.2/readme.txt`
- [wpf-lite]: `wpforms-lite/tags/2.0.2.2/lite/wpforms-lite.php`
- [wpf-process]: `wpforms-lite/tags/2.0.2.2/includes/class-process.php`
- [wpf-file]: `wpforms-lite/tags/2.0.2.2/src/Forms/Fields/FileUpload/Field.php`
- [wpf-gdpr]: `wpforms-lite/tags/2.0.2.2/includes/fields/class-gdpr-checkbox.php`
- [wpf-db]: `wpforms-lite/tags/2.0.2.2/src/Db/`, `src/Tasks/Meta.php`, `src/Logger/Repository.php`
- [wpf-svn-log]: https://plugins.trac.wordpress.org/log/wpforms-lite/tags
- [wpf-data]: https://wpforms.com/where-does-wpforms-data-go/
- [wpf-wpml]: https://wpml.org/plugin/wpforms
- [wpf-vuln]: https://www.wpvulnerability.net/plugin/wpforms-lite/

### Jetpack 16.3.1 (jetpack-forms 8.3.2)

- [jp-block]: https://github.com/Automattic/jetpack-forms/blob/v8.3.2/src/blocks/contact-form/class-contact-form-block.php
- [jp-form]: https://github.com/Automattic/jetpack-forms/blob/v8.3.2/src/contact-form/class-contact-form.php
- [jp-plugin]: https://github.com/Automattic/jetpack-forms/blob/v8.3.2/src/contact-form/class-contact-form-plugin.php
- [jp-upload]: https://github.com/Automattic/jetpack-production/blob/16.3.1/unauth-file-upload.php
- [jp-sync]: https://github.com/Automattic/jetpack-production/blob/16.3.1/jetpack_vendor/automattic/jetpack-sync/src/sync-queue/class-queue-storage-table.php
- [jp-waf]: https://github.com/Automattic/jetpack-production/blob/16.3.1/jetpack_vendor/automattic/jetpack-waf/src/class-waf-blocklog-manager.php
- [jp-changelog]: https://github.com/Automattic/jetpack-production/blob/16.3.1/CHANGELOG.md
- [jp-patchstack]: https://patchstack.com/database/wordpress/plugin/jetpack

### Kadence Blocks 3.8.0.1

- [kb-actions]: https://github.com/stellarwp/kadence-blocks/blob/3.8.0.1/src/blocks/advanced-form/components/submit-actions/options/index.js
- [kb-ajax]: https://github.com/stellarwp/kadence-blocks/blob/3.8.0.1/includes/advanced-form/advanced-form-ajax.php
- [kb-captcha-verify]: https://github.com/stellarwp/kadence-blocks/blob/3.8.0.1/includes/advanced-form/advanced-form-captcha-verify.php
- [kb-captcha]: https://github.com/stellarwp/kadence-blocks/blob/3.8.0.1/includes/advanced-form/advanced-form-captcha-settings.php
- [kb-rest]: https://github.com/stellarwp/kadence-blocks/blob/3.8.0.1/includes/advanced-form/advanced-form-rest-api.php
- [kb-cpt]: https://github.com/stellarwp/kadence-blocks/blob/3.8.0.1/includes/advanced-form/advanced-form-cpt.php
- [kb-settings]: https://github.com/stellarwp/kadence-blocks/blob/3.8.0.1/includes/settings/class-kadence-blocks-settings.php
- [kb-tables]: https://github.com/stellarwp/kadence-blocks/tree/3.8.0.1/includes/resources (`Optimizer/Database/`, `Design_Tokens/Database/`)
- [kb-readme]: https://github.com/stellarwp/kadence-blocks/blob/3.8.0.1/readme.txt
- [kb-patchstack]: https://patchstack.com/database/wordpress/plugin/kadence-blocks

### Otter Blocks 3.2.8

- [ot-export]: https://github.com/Codeinwp/otter-blocks/blob/v3.2.8/inc/plugins/class-form-records-export.php
- [ot-reg]: https://github.com/Codeinwp/otter-blocks/blob/v3.2.8/inc/class-registration.php (and `.distignore` excluding `/plugins`)
- [ot-server]: https://github.com/Codeinwp/otter-blocks/blob/v3.2.8/inc/server/class-form-server.php
- [ot-subs]: https://github.com/Codeinwp/otter-blocks/blob/v3.2.8/inc/plugins/class-form-submissions.php
- [ot-dash]: https://github.com/Codeinwp/otter-blocks/blob/v3.2.8/inc/plugins/class-dashboard.php
- [ot-pro]: https://github.com/Codeinwp/otter-blocks/blob/v3.2.8/inc/class-pro.php
- [ot-releases]: https://github.com/Codeinwp/otter-blocks/releases
- [ot-patchstack]: https://patchstack.com/database/wordpress/plugin/otter-blocks

### WPGraphQL integrations

- [wpgql-ext]: https://www.wpgraphql.com/extensions (form entries: Ninja Forms and Gravity Forms)
- [wpgql-registry]: https://github.com/wp-graphql/wp-graphql/blob/main/plugins/wp-graphql/src/Admin/Extensions/Registry.php (WPGraphQL 2.24.2)
- [nf-gql]: https://github.com/toriphes/wp-graphql-ninja-forms (0.1.4, last commit 2021-09-24)
- [ff-gql]: https://github.com/FullStackIndustries/wp-graphql-fluent-forms (last commit 2024-05-30)
- [wpf-gql]: https://github.com/dazza-dev/sw-wpforms-graphql (last commit 2026-07-27)
- [gf-gql]: https://github.com/AxeWP/wp-graphql-gravity-forms (v0.13.4, for paid Gravity Forms)
