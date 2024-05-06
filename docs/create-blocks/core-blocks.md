# WP Core Blocks

## How to extend a Core Block

If you'd like to extend a Core Block, you'll still need to handle the frontend of the block.

Here are the steps to follow :

1. Uncomment the unregistering of the core block in the `excludedBlocks` array in `wordpress/theme/lib/editor/_loader.ts` file.
2. Follow the steps from the [How to Create Blocks](./create-blocks.md) guide, and omit all the steps about the `edit.tsx` file.
3. On the `edit.tsx` file, instead of exporting a functional component + the block registration configuration, you can export filters to override/modify the behavior of the Core block. ([📚 You can read more on the existing filters/hooks in here](https://developer.wordpress.org/block-editor/reference-guides/filters/block-filters/#blocks-registerblocktype).)<br />
   To do so, you need to export an object of type `WpFilterType` that will automatically be called within the `_loader.ts` file using the `addFilter` WP function ([have a look at how it's handled](https://github.com/superhuit-agency/nextjs-wordpress-starter/blob/boilerplate-update/wordpress/theme/lib/editor/_loader.ts#L49-L55)).<br />
   **Example :**

    ```tsx
    export const MyCustomWpBlockSettings: WpFilterType = {
    	hook: 'blocks.registerBlockType',
    	namespace: 'supt/my-custom-wp-block-settings',
    	callback: (settings, name) => {
    		if (name === block.slug) {
    			settings.name = 'My custom name';
    		}

    		return settings;
    	},
    };
    ```

4. Make sure the `slug` defined in the `block.json` is the Core block slug (example: `core/wp-block`)
5. On the `src/components/global/Blocks.tsx` file, make sure your newly created block matches the Core block slug.<br />
   **Example :**
    ```tsx
     const blocksList: BlocksType = {
       ...
       'core/wp-block': MyCustomWpBlock
     }
    ```

## List of Core Blocks recommanded to use

Among WP Core blocks, here is a list of blocks we recommend you to use / take inspiration from:

-   `core/details` ([code source](https://github.com/WordPress/gutenberg/tree/trunk/packages/block-library/src/details))
-   `core/table` ([code source](https://github.com/WordPress/gutenberg/tree/trunk/packages/block-library/src/table))
-   `core/file` ([code source](https://github.com/WordPress/gutenberg/tree/trunk/packages/block-library/src/file))
-   `core/columns` ([code source](https://github.com/WordPress/gutenberg/tree/trunk/packages/block-library/src/columns))
-   `core/table-of-contents` - may be useful Post ([code source](https://github.com/WordPress/gutenberg/tree/trunk/packages/block-library/src/table-of-contents))

You can have a look to the code source of all the Core Blocks [in here](https://github.com/WordPress/gutenberg/tree/trunk/packages/block-library/src).
