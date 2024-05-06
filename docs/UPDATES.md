# Migration Guide : Checklist after wordpress updates

## Blocks and Components

-   **Check if the Heading block edition is still working** : in the editor - We use CSS tricks to hide the native heading dropdown and put our instead so we can choose which heading level to use. This is a bit hacky and might break with new WP versions.

## Plugins

-   We have forked **WP GraphQL Gutenberg** and **WP GraphQL Offset Pagination** plugins due to deprecation warnings (See Felipe's PR [ for WP GraphQL Gutenberg's fix](https://github.com/pristas-peter/wp-graphql-gutenberg/pull/193) and [for WP GraphQL Offset Pagination's fix](https://github.com/valu-digital/wp-graphql-offset-pagination/pull/16)). We should keep an eye on theses plugins to see if we still need to update them with the new WP updates.
