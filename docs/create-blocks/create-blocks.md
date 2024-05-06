# 🛠 How to Create Blocks

Learn how to create editable blocks with WordPress's Gutenberg and Next.js

## Introduction to Blocks

In the WordPress ecosystem, a "block" is a reusable piece of content, editable through WordPresss.

In our boilerplate, each block have two essential parts:

-   **Front-End Component (`index.tsx`)**: A React component for rendering the block's content in the user interface.

-   **Editor Component (`edit.tsx`)**: Defines how the block appears and features within the WordPress editor, including its settings and editable attributes.

## 🧱 Block Structure Overview

Every custom block you create will typically include the following components:

-   **`block.json`**: Defines the block's metadata, such as its unique slug (should always be prefixed like `supt/***`) and title (which will be displayed in WP admin).
-   **`data.ts`**: [Optional] The data fetching logic for the block. (📚 [Read more about this file](fetch-data.md))
-   **`edit.tsx`**: The WordPress editor component for block settings and attributes. (📚 [Read more about this file](#dive-into-edittsx))
-   **`index.tsx`**: The React component rendered on the front end.
-   **CSS Files**: `styles.css` for front-end styling and `styles.edit.css` for editor-specific styling (if needed).
-   **Storybook Story File** - `**.stories.tsx`: Optional but recommended for testing the block's UI.

## 🛠️ Creating a New Block: Step-by-Step

### Step 1: Initialize Your Block

Start by generating the block's scaffolding using our plop script:

```bash
npm run generate:block
```

Follow the prompts to define your block's characteristics, such as title, slug, and options.

### Step 2: Define Your Block

Navigate to the newly created directory in your blocks folder and begin shaping your block:

-   **`block.json`**: Ensure it accurately reflects your block's purpose.
-   **`edit.tsx`**: Craft the Gutenberg editor experience for your block.
-   **`index.tsx`**: Implement the React component for front-end display.
-   <strong>`**.stories.tsx`</strong>: Optionally develop a story to prototype your block's UI on Storybook.

### Step 3: (Optional) Fetch datas

If needed, fetch & format the datas from WP using GraphQL within the **`data.ts`** file.<br />
📚 [Read more about this file](./fetch-data.md)

### Step 3: Apply Styles

Tailor your block's appearance using `styles.css` for the front end and `styles.edit.css` for the WordPress editor.

### Step 4: Test Your Creation

-   **Storybook**: Validate the block's UI in isolation.
-   **WordPress Editor**: Add your block and experiment with its functionalities.
-   **Front End**: Check the block's rendering on live pages or posts.

## Dive into `edit.tsx`

The editor component (`edit.tsx`) contains 2 sections:

-   **The Edit Function**: Manages the block's representation in the Gutenberg editor, including its controls and editable fields.

> **📚 Read more on [how to make a block editable](./make-block-editable.md).**

-   **Block Configuration**: Specifies the block's attributes, such as its title, description, icon, category, and more.

```tsx
// Example of a Button block configuration
export const ButtonBlock: WpBlockType = {
	slug: block.slug,
	settings: {
		title: block.title,
		description: 'A simple button block.',
		icon: 'button',
		category: 'design',
		attributes: {
			// Block attributes definition
		},
		postTypes: ['post', 'page'],
		edit: Edit,
		save: () => null,
	},
};
```

> We've added a custom property `postTypes` for the blocks' settings to define on which WP Post Type it can be available.<br /> 📚 [Learn more on how we've handled blocks whitelisting in here.](../features/blocks-whitelisting.md)

## How are Blocks Rendered?

When you create a custom block, both Next.js and WordPress should be able to render it. Here's how it works:

### Next.js

In components global files, you can find the `Blocks.tsx` file. This files is responsible for rendering the blocks in the front-end from the Wordpress data. As you can see, front end components are imported and matched with the block's slug. In the Block render function, the good block is rendered with the appropriate WP attributes.

Normally, you don't need to change this file, but if you want to add a new block without using the generation script, you need to import the block's front-end component and add it to the switch statement.

### WordPress

In the wordpress editor folder, you will find the `_loader.ts` file. This file is responsible for registering each block in the Wordpress editor. The block's settings are imported and registered in the `registerBlockType` function. Filters are also registered within this file.

## Core Blocks

You can have a look at the [documentation for Core Blocks in here](./core-blocks.md).

## 📚 Further Reading and Resources

-   [WordPress Block Editor Handbook](https://developer.wordpress.org/block-editor/)
-   [Next.js Documentation](https://nextjs.org/docs)
-   [React Official Documentation](https://reactjs.org/docs/getting-started.html)
