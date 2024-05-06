# Get GraphQL Linter / Syntax Highlighting

## Update settings of WPGraphQL Plugin

**/!\ On dev env only<br />**
On WPGraphQL General Settings page, make sure `Restrict Endpoint to Authenticated Users` is disabled, and `Enable Public Introspection` is enabled.

## Generate GraphQL Schema locally

-   Make sure you have `graphql-cli` installed globally (you can install it with `npm install -g graphql-cli`)
-   Make sure WP is running (you can access to [http://localhost/graphql](http://localhost/graphql))
-   Generate the GraphQL Schema locally by running `graphql get-schema`

GraphQL Linter should now be available within any `gql` query within the `data.ts` files
