# Caching

This document explains how the Next.js app caches what it reads from WordPress, and how that cache is refreshed when an editor changes something.

## Overview

The app uses Next.js 16 [Cache Components](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents) (`cacheComponents: true` in `next/next.config.ts`):

- Every cached read of WordPress runs in a `'use cache'` scope with `cacheLife('max')`. It never expires on a timer.
- Each cached entry carries **cache tags** naming what it depends on.
- When an editor changes something, the [nextjs-revalidate](https://github.com/superhuit-agency/nextjs-revalidate) plugin sends a **Change** to `POST /api/revalidate`. The route turns it into `revalidateTag(tag, 'max')` calls.
- `'max'` means stale-while-revalidate: the entry is marked stale, not deleted. The next visitor gets the stale page while a fresh one is generated, and the visitor after that gets the new content.
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
| `node:{databaseId}` | the public node read; block data rendering one post | a `post` change for that ID |
| `nodes:{contentType}` | the public node read of a single post, page… of that type | a scoped `all` of that type. Editing one post clears only its `node:` tag |
| `type:{contentType}` | listings (Query, Latest Posts), post type archives, next / previous post links, per-type sitemaps | a `post` change of that type |
| `content` | listings with no type filter; the sitemap index; blocks that declare no tags | every `post` change |
| `term:{databaseId}` | reads that display a term: post terms, the public node read, term archives | a term change (not mapped yet, see [Known gaps](#known-gaps-until-plugin-v21)) |
| `taxonomy:{taxonomy}` | term listings | a scoped `all` of a type using that taxonomy; a term change once mapped |
| `menu:{id}` | Navigation block data (block menu ID) | a `menu` change for that ID |
| `settings` | the public node read (it also returns Site settings: SEO defaults, site title), site title / tagline / logo / date blocks, the locale list, sitemaps, blocks that declare no tags | a `settings` change, or `all` |
| `templates` | the FSE template read | a `templates` change, or `all` |
| `redirect:{uri}` | the redirect lookup for that URI, including a "no redirect" result | a `redirect` change for that URI |
| `uris` | public node reads that found **no** node (cached 404s); Page-dependent blocks that found no post at the Base URI | a `post` change whose URI changed (publish, unpublish, trash, delete, slug change), or `all` |
| `nodes` | every cached read | `all` only: the manual lever |

Term tags use the term's database ID, not its slug, so a slug rename needs no old slug. Queries that render terms must fetch `databaseId`.

### Cached reads

| Read | File | Tags |
| --- | --- | --- |
| Public node read | `next/src/lib/get-node-by-uri.ts` (`getPublicNodeByURI`) | `node:{id}`, `nodes:{type}`, `settings`, the `term:` tags of its categories and tags; a post type archive gets `type:{type}`; no node found → `uris` |
| Redirect lookup | `next/src/lib/get-redirection.ts` | `redirect:{uri}` |
| Locale list | `next/src/i18n/get-locales.ts` | `settings` |
| FSE templates | `next/src/lib/get-fse-templates.ts` | `templates` (see [FSE Templating](./fse-templating.md#refreshing-templates)) |
| Sitemap | `next/src/lib/get-sitemap-data.ts` | index: `content` + `settings`; per type: `type:{type}` + `settings` |
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
POST /api/revalidate
Authorization: Bearer <REVALIDATE_SECRET>
Content-Type: application/json

{ "version": 2, "changes": [ { "subject": "post", "id": 42, "type": "post", "before": { "uri": "/hello/" }, "after": { "uri": "/hello-world/" } } ] }
```

The secret comes from `REVALIDATE_SECRET` (see `next/.env.example`) and must match the one set in the plugin. It travels in a header, never in the URL, so it doesn't leak through access logs, browser history or referrers.

How each change is mapped:

| Change | Clears |
| --- | --- |
| `post` | `node:{id}`, `type:{type}`, `content`; plus `uris` when `before.uri !== after.uri` (a missing side counts as no URI) |
| `redirect` | `redirect:{uri}`, the URI normalised by `normalizeUri` as in the lookup: path only, decoded, lowercased, with leading and trailing slashes |
| `path` | `revalidatePath(uri)`: the path as the visitor sees it, not a rewritten route |
| `menu` | `menu:{id}` (`locations` is ignored: nothing reads classic menus by location) |
| `templates` | `templates` |
| `settings` | `settings` |
| `all` | `nodes`, `settings`, `templates`, `uris`: everything |
| `all` with `type` | `nodes:{type}`, `type:{type}`, and `taxonomy:{t}` for each of `taxonomies` |

Responses:

| Request | Response |
| --- | --- |
| Missing or wrong secret | `401` |
| Body isn't JSON, `version` isn't `2`, or `changes` is missing | `400`, so the plugin reports a failure in wp-admin |
| Anything else | `200` as soon as the tags are marked stale |

Unknown subjects and unknown fields are ignored, so a minor plugin release never breaks the site. The contract is covered by `route.test.ts` (`npm --prefix ./next test`). If you change the route, change the tests with it.

---

## Known gaps until plugin v2.1

Term edits don't reach the site on their own yet. Renaming a category or tag, or changing its slug, sends no change the route maps. The `term:` and `taxonomy:` tags are already in place; the mapping waits for [nextjs-revalidate#55](https://github.com/superhuit-agency/nextjs-revalidate/issues/55).

Site settings aren't affected: the plugin sends a `settings` change from v2.0 ([nextjs-revalidate#171](https://github.com/superhuit-agency/nextjs-revalidate/issues/171)).

**Workaround:** after a term edit, use **Purge all** in the plugin's wp-admin screen. It sends an `all` change, which marks every cached entry stale. Pages then refresh one by one as they're requested, each asking WordPress again, so avoid it on a busy site at peak time.

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
- **`<Activity>` ships with Cache Components.** Component state (dropdowns, dialogs, form inputs) now survives client-side navigation. This will likely be reported as a component bug: reset state on navigation where it matters.
- **Floods of random URLs.** Each URL that finds no post is cached as a small 404, and the LRU doesn't count key overhead against its limit. A flood of random URLs (e.g. a bot scan) creates many small entries that use more memory than the 50 MB limit implies. It's still much better than each one reaching WordPress.
- **Sizing.** Hot entries evicted by a too-small `cacheMaxMemorySize` show up as misses, not errors. See [Sizing the cache](#sizing-the-cache).

---

## Verifying caching end to end

Automated tests cover the route's contract only. Check the rest by hand against a real WordPress running nextjs-revalidate 2.0, after any change to the reads, the tags or the route.

Always use a production build, never `next dev`:

```bash
cd next
npm run build
NEXT_PRIVATE_DEBUG_CACHE=1 npm run start
```

After a change, a page should go **HIT → STALE → HIT**, with the new content on the last HIT. A **MISS** in between means something expired or was evicted instead of going stale.

Read it from the `x-nextjs-cache` response header (e.g. `curl -sI http://localhost:3000/hello/ | grep -i x-nextjs-cache`). Next doesn't set that header on a response that streams dynamic holes into the static shell, so when it's missing, follow the entries in the `NEXT_PRIVATE_DEBUG_CACHE` log instead.

Check the sequence for each of these:

- [ ] Editing a post
- [ ] Publishing a new post: it appears in listings
- [ ] Changing a slug: the old URI stops serving, the new one works
- [ ] Publishing at a URI that used to 404
- [ ] Editing a template part in the Site Editor
- [ ] Editing a block menu in the Site Editor
- [ ] Adding a redirect
- [ ] Purge all

And:

- [ ] Editing one post doesn't refresh an unrelated post's page.
- [ ] A `path` change evicts that path's cached entries.
- [ ] Preview shows the latest draft and bypasses the cache.
- [ ] The WordPress editor bundle builds (`npm --prefix ./wordpress run build`) and blocks show live data in the editor.
- [ ] `npm run build` still reports the catch-all page (`/[[...uri]]`) as a static shell (Partial Prerendering).
