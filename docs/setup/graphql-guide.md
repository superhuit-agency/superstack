# Get GraphQL Linter / Syntax Highlighting

## Update settings of WPGraphQL Plugin

**/!\ On dev env only<br />**
On WPGraphQL General Settings page, make sure `Restrict Endpoint to Authenticated Users` is disabled, and `Enable Public Introspection` is enabled.

## Generate GraphQL Schema locally

-   Make sure you have `graphql-cli` installed globally (you can install it with `npm install -g graphql-cli`)
-   Make sure WP is running (you can access to [http://localhost/graphql](http://localhost/graphql))
-   Generate the GraphQL Schema locally by running `graphql get-schema`

GraphQL Linter should now be available within any `gql` query within the `data.ts` files

## `blocksJSON` vs `blocks` (WPGraphQL Gutenberg)

If your goal is to render **all blocks with unknown nesting depth**, prefer `blocksJSON`.

-   `blocksJSON`:
    -   one field, complete tree (including deep `innerBlocks`)
    -   stable query shape
    -   parse cost is moved to your app (JSON parsing + mapping)
-   `blocks`:
    -   typed GraphQL fields (`name`, `attributes`, `innerBlocks`, etc.)
    -   requires hardcoded nesting depth in the query
    -   deeper queries usually increase resolver work and payload size

In this starter, templates request `blocksJSON` and then enrich blocks server-side (`formatBlocksJSON`), which is generally the safest default for unknown depth.

### How to measure (recommended)

Benchmark both approaches on the **same content** (light page + heavy nested page):

1. Run each query 20-50 times (warm cache first, then measure).
2. Record:
    - server execution time (GraphQL debug tools / logs)
    - response size in bytes
    - client parsing time (`JSON.parse` + formatting for `blocksJSON`)
    - end-to-end TTFB
3. Compare p50 and p95 (not only averages).

Practical rule:

-   Need the full block tree reliably -> use `blocksJSON`.
-   Need only a small, known subset of shallow fields -> use `blocks` with limited depth.
