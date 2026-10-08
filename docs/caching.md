# Caching

This document explains how the Next.js app caches what it reads from WordPress, and how that cache is refreshed when an editor changes something.

## Overview

The app uses Next.js 16 [Cache Components](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents) (`cacheComponents: true` in `next/next.config.ts`):

- Every cached read of WordPress runs in a `'use cache'` scope with `cacheLife('max')`. It isn't refreshed on a timer, only by a Change (the in-memory cache handler still drops it after 30 days, see [Known gaps](#known-gaps)).
- Each cached entry carries **cache tags** naming what it depends on.
- When an editor changes something, the [nextjs-revalidate](https://github.com/superhuit-agency/nextjs-revalidate) plugin sends a **Change** to `POST /api/revalidate`. The route turns it into `revalidateTag(tag, 'max')` calls.
- `'max'` means stale-while-revalidate: the entry is marked stale, not deleted. The next visitor gets the stale page while a fresh one is generated, and the visitor after that gets the new content.
- A change that may turn a cached page into a redirect **expires** that page instead (`revalidateTag(tag, { expire: 0 })` or `revalidatePath`): the next visitor waits for a fresh render. See [Redirects are never re-rendered in the background](#redirects-are-never-re-rendered-in-the-background).
- Public pages are served from a prerendered static shell. WordPress is only asked again for what changed, and only when someone next requests it.
- Preview never reads or writes the cache.

> **`cacheTag` declares what an entry depends on; `revalidateTag` announces what changed.**
>
> An entry carries only the tags of the things it actually renders. The route never needs to know which pages show a post: it announces "post 42 changed", and every entry that declared `node:42` goes stale.

---

## Tags

Tag names are built by one helper module, `next/src/lib/cache-tags.ts`, used both by the reads and by the revalidate route, so the two can't drift apart. Never write a tag name by hand.

| Tag | Carried by | Cleared when |
| --- | --- | --- |
| `node:{databaseId}` | the public node read of that post, and of each of its descendants, whose breadcrumbs show its title and URI; block data rendering one post; Navigation block data, for each link bound to a post (the theme resolves its URL to the post's current one) | a `post` change for that ID |
| `nodes:{contentType}` | the public node read of a single post, page… of that type | a scoped `all` of that type. Editing one post clears only its `node:` tag |
| `type:{contentType}` | listings (Query, Latest Posts), post type archives, next / previous post links, per-type sitemaps | a `post` change of that type |
| `content` | term listings whose terms depend on their posts (Terms Query; Taxonomy List when it shows post counts or hides empty terms); listings with no type filter; the sitemap index and the taxonomy sitemaps; blocks that declare no tags | every `post` change |
| `term:{databaseId}` | reads that display a term: post terms, the public node read, term archives, Navigation block data for each link bound to a term | a term change (not mapped yet, see [Known gaps](#known-gaps)) |
| `taxonomy:{taxonomy}` | term listings, term sitemaps and the sitemap index | a scoped `all` of a type using that taxonomy; a term change once mapped |
| `menu:{id}` | Navigation block data (block menu ID) | a `menu` change for that ID |
| `settings` | the public node read (it also returns Site settings: SEO defaults, site title), site title / tagline / logo / date blocks, the locale list, the 404 breadcrumbs, sitemaps, blocks that declare no tags | a `settings` change, or `all` |
| `templates` | the FSE template read | a `templates` change, or `all` |
| `redirects` | every redirect lookup, so every cached 404 and cached redirect | `all` only |
| `redirect:{uri}` | the redirect lookup for that URI, including a "no redirect" result | a `redirect` change for that URI |
| `uris` | public node reads that found **no** node (cached 404s); on a multilingual site, every public node read, since it links to its translations (hreflang, language switcher); Page-dependent blocks that found no post at the Base URI | a `post` change whose URI changed (publish, unpublish, trash, delete, slug change), or `all` |
| `nodes` | every cached read | `all` only: the manual lever |

Term tags use the term's database ID, not its slug, so a slug rename needs no old slug. Queries that render terms must fetch `databaseId`.

### Cached reads

| Read | File | Tags |
| --- | --- | --- |
| Public node read | `next/src/lib/get-node-by-uri.ts` (`getPublicNodeByURI`) | `node:{id}`, `nodes:{type}`, `settings`, the `term:` tags of its categories and tags, the `node:` tags of a page's ancestors; a post type archive gets `type:{type}`; `uris` on a multilingual site or when no node is found |
| Redirect lookup | `next/src/lib/get-redirection.ts` | `redirect:{uri}`, `redirects` |
| Locale list | `next/src/i18n/get-locales.ts` | `settings` |
| 404 breadcrumbs | `next/src/lib/get-not-found-breadcrumbs.ts` | `settings` |
| FSE templates | `next/src/lib/get-fse-templates.ts` | `templates` (see [FSE Templating](./fse-templating.md#refreshing-templates)) |
| Sitemap | `next/src/lib/get-sitemap-data.ts` | index: `content` + `settings` + `taxonomy:{taxonomy}` of each taxonomy; per type: `type:{type}` + `settings`; per taxonomy (term archives): `taxonomy:{taxonomy}` + `content` + `settings` |
| Block data | `next/src/lib/get-cached-block-data.ts` | the block's own `cacheTags` |

All of them also carry `nodes`. The build-time URI list (`get-all-uris.ts`, used by `generateStaticParams`) is not cached: it only runs during the build.

The public node read takes plain arguments only (URI, language, route page), since they make up the cache key. Preview uses a separate, uncached read (`getPreviewNodeByURI`) that carries the user's auth token. Never pass a token or a preview flag to a cached function.

---

## Block data

A block's `data.ts` is bundled into both the Next server and the WordPress block editor, so it never imports `next/cache`. Outside preview, its `getData` runs inside `getCachedBlockData` (`next/src/lib/get-cached-block-data.ts`), a Next-only wrapper with one cache entry per block name, attributes and language.

A block declares two things in its `data.ts`:

- **`cacheTags`**, returned next to the data and built with `cache-tags.ts`, e.g. `{ title, cacheTags: [cacheTags.settings()] }`. A block returning none falls back to `content` and `settings`, so it's fetched again after every post or settings change. A block returning `cacheTags: []` is only refreshed by Purge all.
- **`export const usesBaseUri = true;`**, for a Page-dependent block, one that reads the Base URI through `baseUriContext()`. It adds the Base URI to the block's cache key. Every other block gets one entry per site, not per page, which keeps WordPress load and cache memory down. Forgetting it is an ESLint error, and fails `next build` with a `BaseUriNotDeclaredError`.

Which tags to return for which data, and why the opt-in exists, is detailed in [FSE Templating › Caching block data](./fse-templating.md#caching-block-data).

---

## The revalidate route

`next/src/app/api/revalidate/route.ts` speaks version 2 of the nextjs-revalidate contract:

```http
POST /api/revalidate/
Authorization: Bearer <REVALIDATE_SECRET>
Content-Type: application/json

{ "version": 2, "changes": [ { "subject": "post", "id": 42, "type": "post", "before": { "uri": "/hello/" }, "after": { "uri": "/hello-world/" } } ] }
```

The secret comes from `REVALIDATE_SECRET` (see `next/.env.example`) and must match the one set in the plugin. It travels in a header, never in the URL, so it doesn't leak through access logs, browser history or referrers.

**A front-end behind basic auth** (e.g. a staging site) has its credentials in the plugin's revalidate domain: `https://user:pass@staging.example.com`. From nextjs-revalidate 2.1, the plugin then sends them as `Authorization: Basic …`, and the secret in a header of its own:

```http
Authorization: Basic <base64(user:pass)>
X-Nextjs-Revalidate-Secret: <REVALIDATE_SECRET>
```

The route reads `X-Nextjs-Revalidate-Secret` when the request has it, and `Authorization: Bearer` otherwise, both compared in constant time. Plugin 2.0 can't reach a front-end behind basic auth: its `Bearer` replaces the credentials. The starter pins 2.0.0 in `wordpress/composer.json`, so update it to 2.1 for such a site.

How each change is mapped:

| Change | Clears |
| --- | --- |
| `post` | `node:{id}`, `type:{type}`, `content`; plus `uris` when `before.uri !== after.uri` (a missing side counts as no URI), and then `revalidatePath(before.uri)` when there is one |
| `redirect` | `redirect:{uri}`, expired, the URI normalised by `normalizeUri` as in the lookup: path only, decoded, lowercased, with leading and trailing slashes; and `revalidatePath(uri)` |
| `path` | `revalidatePath(uri)`: the path as the visitor sees it, not a rewritten route |
| `menu` | `menu:{id}` (`locations` is ignored: nothing reads classic menus by location) |
| `templates` | `templates` |
| `settings` | `settings` |
| `all` | `nodes`, `settings`, `templates`, `uris`: everything; and `redirects`, expired |
| `all` with `type` | `nodes:{type}`, `type:{type}`, and `taxonomy:{t}` for each of `taxonomies` |

Renaming a parent page sends a `post` change for the parent only. Its descendants' node reads carry `node:{parent}` for their breadcrumbs, so they go stale too: one entry per descendant (and per paginated route), however small the edit. When the parent's slug or its own parent changes, the plugin also reports each descendant whose URI moved as a `post` change of its own, so its old URI stops serving.

Responses:

| Request | Response |
| --- | --- |
| Missing or wrong secret | `401` |
| Body isn't JSON, `version` isn't `2`, or `changes` is missing | `400`, so the plugin reports a failure in wp-admin |
| Anything else | `200` as soon as the tags are marked stale or expired |

Unknown subjects and unknown fields are ignored, so a minor plugin release never breaks the site. The contract is covered by `route.test.ts` (`npm --prefix ./next test`). If you change the route, change the tests with it.

### Redirects are never re-rendered in the background

The catch-all page looks a redirect up only for a URI that has no node, and calls `permanentRedirect()` or `redirect()` when it finds one. When a stale entry is re-rendered in the background and that render ends in a redirect, Next 16.2 caches the response as a 308 (or 307) **without its `Location` header**, and serves it as a HIT until the next invalidation. Clients without JavaScript (crawlers, `curl`, link checkers) can't follow it. A blocking render caches the redirect correctly.

So every change that can turn a cached page into a redirect expires that page rather than marking it stale:

- a `redirect` change: `redirect:{uri}`, which a cached 404 at that URI carries, and the page at the path (`revalidatePath`), which may be a page rather than a 404, e.g. a post's old URI once Redirection's slug monitor redirects it;
- a `post` change whose URI changed: the page at its old URI (`revalidatePath(before.uri)`), which an existing redirect from that URI now applies to. Its descendants' old URIs too: the plugin sends a change for each of them;
- `all`: `redirects`, which every cached 404 and cached redirect carries (only a URI with no node looks a redirect up), so a URI that is now a redirect source, or a redirect to another target, renders it. This is what makes Purge all a workaround for [regex redirections](#regex-redirections).

Only tags that no change marks stale are expired: a later `revalidateTag(tag, 'max')` on an expired tag replaces its expiry, and the page would be re-rendered in the background after all. That's why the post's `node:{id}` and `uris` stay stale-while-revalidate, and the old URI is expired by path instead.

The next request for each of these pages waits for WordPress (`x-nextjs-cache: MISS`). They are rare changes, and only those pages pay for it: one page per redirect or moved post, and every cached 404 and cached redirect on Purge all.

---

## Known gaps

### Term changes

Term edits don't reach the site on their own yet. nextjs-revalidate 2.1 reports a `term` change when a category or tag is created, edited or deleted, but the route doesn't map it yet ([#154](https://github.com/superhuit-agency/superstack/issues/154)): it ignores it like any unknown subject. The `term:` and `taxonomy:` tags are already in place.

Site settings aren't affected: the plugin sends a `settings` change from v2.0 ([nextjs-revalidate#171](https://github.com/superhuit-agency/nextjs-revalidate/issues/171)).

A post's breadcrumbs can also show what its node read isn't tagged with: the parent categories of its category, and on a site with a static front page, the posts page. Renaming either leaves the trail as it was until the post itself changes. A page's ancestors are covered (see [The revalidate route](#the-revalidate-route)).

**Workaround:** after a term edit or a posts page rename, use **Purge all** in the plugin's wp-admin screen (**Settings › Next.js Revalidate**). It sends an `all` change, which marks every cached entry stale. Pages then refresh one by one as they're requested, each asking WordPress again, so avoid it on a busy site at peak time.

### Options that move URIs

The permalink structure and the category and tag bases (**Settings › Permalinks**) move the URI of every post or term at once, and the plugin reports no change for them. Use **Purge all** after saving them.

The front page and the posts page (**Settings › Reading**) are reported: the theme adds `show_on_front`, `page_on_front` and `page_for_posts` to the plugin's site settings (`wordpress/theme/includes/admin/nextjs-revalidate.php`), so saving them sends a `settings` change. Every public node read carries `settings`, so the page at `/` and the posts page follow. What only shows a page's URI doesn't: listings and menu links still point to the old front page at `/`, and a cached 404 at a URI that now has content stays a 404, until their own change or a **Purge all**.

### Regex redirections

See [Regex redirections](#regex-redirections): use **Purge all** after changing a regex rule.

### Entries expire after 30 days in memory

`cacheLife('max')` revalidates after 30 days. The default in-memory cache handler doesn't serve a stale entry past that window: it treats an entry written more than 30 days ago as missing (`next/dist/server/lib/cache-handlers/default.js`). The content isn't wrong, but the next request for it is a **MISS** that waits for WordPress, as after an eviction. On a site nobody edits for a month, each page pays one such render.

---

## Regex redirections

A Redirection rule whose source is a regular expression (e.g. `^/old-blog/(.*)` → `/blog/$1`) doesn't reach the site on its own. The redirect lookup caches its answer per URI, "no redirect" included, and the plugin sends no change for a regex rule since it names no single path (nextjs-revalidate 2.0 and 2.1, `Integrations/Redirection.php`). Every URI the rule covers that was already looked up keeps answering 404, and editing or deleting the rule leaves the URIs it redirected redirecting.

No tag can cover it from the Next side: the route never hears of the rule.

**Workaround:** after adding, editing, enabling, disabling or deleting a regex rule, use **Purge all**. It expires the cached 404s and cached redirects (see [Redirects are never re-rendered in the background](#redirects-are-never-re-rendered-in-the-background)), so each URI the rule covers, or used to cover, renders its new answer on its next request.

Closing the gap needs the plugin to send a change for a regex rule, e.g. a `redirect` change with no `uri`, which the route would map to the `redirects` tag.

---

## Sizing the cache

The default in-memory cache handler is used. It's an LRU cache limited by `cacheMaxMemorySize` (50 MB by default). An entry that falls out of it isn't stale, it's gone: the next request is a **MISS** that waits for WordPress.

To see whether the limit is too low, start a production build with the debug log (see [Verifying caching end to end](#verifying-caching-end-to-end)). `NEXT_PRIVATE_DEBUG_CACHE=1` logs every cache read and write. Browse the site's most visited pages, then browse them again: pages that should still be cached but log a miss or a new write were evicted. Raise the limit in `next/next.config.ts`:

```ts
const nextConfig: NextConfig = {
	cacheComponents: true,
	cacheMaxMemorySize: 200 * 1024 * 1024, // bytes
	// …
};
```

The memory is taken from the Node process: leave room for it on the server.

Never measure with `next dev`: it adds a hash to cache keys, so entries aren't reused the way they are in production.

---

## Known risks

- **PM2 cluster mode silently breaks tag revalidation.** The cache lives in each process, and a revalidation reaches only the process that received it. The shipped `next/ecosystem.config.js.example` runs a single process. Adding `instances: 'max'` or `exec_mode: 'cluster'` would make invalidation intermittent, with no error. Running several instances needs a shared cache handler (e.g. Redis), which this starter doesn't include.
- **Bursts of WordPress reads.** A change can mark every page stale, and each re-render sends all its block reads at once. `fetchAPI` keeps at most `WORDPRESS_FETCH_CONCURRENCY` (6) requests in flight per process, and retries a refused or dropped read (408, 425, 429, 5xx, network errors, a 15 s timeout) with a jittered backoff, honouring `Retry-After`. It stops after 45 s, waiting for a slot included, before Next's 50 s limit to fill a cache entry during a prerender, so a read fails with its own cause rather than a cache timeout. A cache entry that makes several reads in a row can still reach that limit when WordPress is that slow. Mutations get one attempt. See `next/.env.example`.
  - **Sizing the cap for builds.** `next build` prerenders up to 8 pages at once per worker (`experimental.staticGenerationMaxConcurrency`), and all their reads queue behind that worker's cap. A batch takes about 8 pages × uncached reads per page × WordPress's answer time ÷ the cap: 8 × 30 × 0.3 s ÷ 6 = 12 s, and 32 s at 0.8 s a read (48 s with a cap of 4). A read still waiting for a slot after 45 s fails with `No free slot before the 45000 ms budget ran out`. Then raise `WORDPRESS_FETCH_CONCURRENCY` if WordPress has the PHP workers for it (each build worker gets its own cap), or lower `staticGenerationMaxConcurrency`.
- **No persistence.** The cache is in memory: a restart or a deploy starts it empty, and the first visitors after it wait for WordPress. On serverless, entries may not survive between requests.
- **Preview is slower.** Draft Mode re-runs every cached function and writes nothing, so every block's data is fetched from WordPress on every preview load. That's correct, but editors will notice.
- **`<Activity>` ships with Cache Components.** Component state (dropdowns, dialogs, form inputs) now survives client-side navigation. This will likely be reported as a component bug: reset state on navigation where it matters, in a `useLayoutEffect` on `usePathname()`, which re-runs when `<Activity>` shows the page again (see `NavigationSubmenu`). A page left also stays in the document, hidden: build element IDs with `useId()`, never fixed or from a label, or they appear twice.
- **Floods of random URLs.** Each URL that finds no post is cached as a small 404, and the LRU doesn't count key overhead against its limit. A flood of random URLs (e.g. a bot scan) creates many small entries that use more memory than the 50 MB limit implies. It's still much better than each one reaching WordPress.
- **Sizing.** Hot entries evicted by a too-small `cacheMaxMemorySize` show up as misses, not errors. See [Sizing the cache](#sizing-the-cache).

---

## Verifying caching end to end

Automated tests cover the route's contract only. Check the rest by hand against a real WordPress running nextjs-revalidate 2.0 or later, after any change to the reads, the tags or the route.

Always use a production build, never `next dev`:

```bash
cd next
npm run build
NEXT_PRIVATE_DEBUG_CACHE=1 npm run start
```

After a change, a page should go **HIT → STALE → HIT**, with the new content on the last HIT. A **MISS** in between means something expired or was evicted instead of going stale.

Read it from the `x-nextjs-cache` response header (e.g. `curl -sI http://localhost:3000/hello/ | grep -i x-nextjs-cache`). Next doesn't set that header on a response that streams dynamic holes into the static shell, so when it's missing, follow the entries in the `NEXT_PRIVATE_DEBUG_CACHE` log instead.

To see which reads actually reach WordPress, add `DEBUG_PERFS=1`. `fetchAPI` then prints a table of its WordPress requests (count, total, average and max duration per query) once a burst of requests settles:

```bash
DEBUG_PERFS=1 NEXT_PRIVATE_DEBUG_CACHE=1 npm run start
```

Since `fetchAPI` only runs on a cache miss, reloading a cached page should print nothing, and after a change only the reads carrying the changed tag should show up. The table is per process, and a build worker may exit before printing its own, so read it on `npm run start` rather than during `npm run build`.

Check the sequence for each of these:

- [ ] Editing a post
- [ ] Publishing a new post: it appears in listings
- [ ] Changing a slug: the old URI stops serving, the new one works
- [ ] Renaming a parent page: its child pages' breadcrumbs follow. Changing its slug: the children's old URIs stop serving
- [ ] Publishing at a URI that used to 404
- [ ] On a multilingual site, changing a translation's slug or publishing a new one: the other languages' hreflang and language switcher follow
- [ ] Editing a template part in the Site Editor
- [ ] Editing a block menu in the Site Editor
- [ ] Moving a page a block menu links to (new slug or parent): the menu links to its new URI
- [ ] Adding a redirect, from a cached 404 and from a slug change: the source goes **HIT → MISS → HIT**, a 308 with a `Location` header on both
- [ ] Purge all

And:

- [ ] Editing one post doesn't refresh an unrelated post's page.
- [ ] A `path` change evicts that path's cached entries.
- [ ] Preview shows the latest draft and bypasses the cache.
- [ ] The WordPress editor bundle builds (`npm --prefix ./wordpress run build`) and blocks show live data in the editor.
- [ ] `npm run build` still reports the catch-all page (`/[[...uri]]`) as a static shell (Partial Prerendering).

---

## Upgrading an existing project

A project started before Cache Components (route-level `revalidate = 3600`, nextjs-revalidate 1.x) needs all of this in one deploy:

1. **Deploy nextjs-revalidate ^2.0 together with this route.** Plugin 2.0 speaks contract version 2 (a `POST` with the secret in a header), which the old route doesn't understand, and this route rejects a 1.x request. Update `superhuit-agency/nextjs-revalidate` in `wordpress/composer.json`: 2.1 for a front-end behind basic auth (see [The revalidate route](#the-revalidate-route)).
2. **Configure the plugin** in **Settings › Next.js Revalidate**: the revalidate domain is the front-end's URL (`NEXT_URL`), the secret is the front-end's `REVALIDATE_SECRET`, and the path is `/api/revalidate/`. With its trailing slash, the request skips the 308 that `trailingSlash: true` answers `/api/revalidate` with. The plugin splits a 1.x revalidate URL into a domain and a path on its first admin request after the upgrade: add the trailing slash to that path. See [Deployment](./setup/deployment.md#-configure-nextjs-revalidate).
3. **Remove every `export const revalidate`, `dynamic` and `fetchCache`.** Next 16 fails the build on route segment config with `cacheComponents` on. On a multilingual site that includes `src/app/[lang]/layout.tsx`, generated by the lang migration: also port [#226](https://github.com/superhuit-agency/superstack/pull/226) into it (`notFound()` for a first segment `getLocales()` doesn't list, then `langContext(lang)`), and into `src/app/[lang]/not-found.tsx`, which reads the language back with `langContext()` and passes it to the template and breadcrumbs reads. Compare with `generators/templates/lang-migration/lang-layout.tsx` and `next/src/app/not-found.tsx`.
4. **Update each custom block's `data.ts`** (see [Block data](#block-data)):
   - return the `cacheTags` its data depends on;
   - declare `export const usesBaseUri = true;` if it reads `baseUriContext()`, and `usesArchiveContext` if its data changes with the archive being viewed;
   - stop catching `fetchAPI` errors into `{}` or an empty result: `fetchAPI` throws a `WordPressReadError` on a failed read, which must propagate so the failure isn't cached.
5. **Replace `getNodeByURI`** (now internal to `next/src/lib/get-node-by-uri.ts`) with `getPublicNodeByURI(uri, lang, routePage)`, or `getPreviewNodeByURI(uri, lang, routePage, auth, previewDraft)` in preview. Never pass a token to the public one.
6. **Drop the FSE snapshot.** Remove the `predev` and `prebuild` scripts from `next/package.json`, and delete `next/src/lib/fse/` and `next/scripts/fetch-fse-templates-and-parts.ts`: templates are a cached read now (see [FSE Templating](./fse-templating.md#template-read)).
7. **Optionally**, tune WordPress reads with `WORDPRESS_FETCH_MAX_RETRIES`, `WORDPRESS_FETCH_RETRY_DELAY`, `WORDPRESS_FETCH_TIMEOUT` and `WORDPRESS_FETCH_CONCURRENCY`, and log them with `DEBUG_PERFS=1` (see `next/.env.example`).
8. **Keep PM2 to one instance** (see [Known risks](#known-risks)).

Then run the checks in [Verifying caching end to end](#verifying-caching-end-to-end).
