# Blocks Whitelisting

To handle which blocks are available within WP Block Inserter we've created a custom setting `postTypes` to specify on [the block registration](../create-blocks/create-blocks.md#dive-into-edittsx).

`postTypes` is an Array of post types available within your website (ex: `post`, `page`, `event`, ...).

## Why ?

The need is to customise the list of available blocks depending on the type of WP Posts. We may not want the same blocks within an Event or a Post.

## How ?

You can see where the magic happens in the `wordpress/theme/lib/editor/blocks-whitelist/index.tsx` file.
In short, instead of unregistering the blacklisted blocks (which will lead to a wrong GraphQL Block Registry), we set the block `parent` to an empty array, so it won't display as a root block but makes it still available within the Editor.
