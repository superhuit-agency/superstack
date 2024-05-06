# How To Guide: Defining Fonts on the Stack

This guide details the steps for setting up fonts in Next.js, Wordpress and Storybook sides.

## Utilizing CSS Variables for Fonts

Across the stack, we use CSS variables for the fonts family. Specifically, we use `--font-primary` and `--font-secondary` as our main font variables.

## On Next.js Side

Next.js has introduced `next/font`, a new way to optimize font loading.<br />
[See Next.js documentation for more infos](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)

### Step 1: Import Custom Fonts

If you're using custom fonts that are not hosted by a third-party service (like Google Fonts), you'll need to add them to `src/fonts` directory.

### Step 2: Define Your Fonts using next/font

You can define your fonts in the `layout.tsx` file located at `src/app/[[...uri]]/`. Define your fonts as follows:

```tsx
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';

const inter = Inter({
	subsets: ['latin'],
	variable: '--font-primary',
	display: 'swap',
});

const myCustomFont = localFont({
	src: '../../fonts/my-custom-font.woff2',
	variable: '--font-secondary',
	display: 'swap',
});

export default function Layout() {
	return (
		<html className={`${inter.variable} ${myCustomFont.variable}`}>
			...
		</html>
	);
}
```

## On Wordpress Side

### Step 1: Import Custom Fonts

If you're using custom fonts that are not hosted by a third-party service (like Google Fonts), you'll need to add them to `wordpress/theme/lib/editor/assets/fonts` directory.

### Step 2: Define Your Fonts in CSS

In `_fonts.css` file located in `wordpress/theme/lib/editor/assets/css/`. Add your font-face declarations as follows:

```css
@font-face {
	font-family: 'My custom font';
	src:
		url('../editor/assets/fonts/my-custom-font.woff2') format('woff2'),
		url('../editor/assets/fonts/my-custom-font.woff') format('woff');
	font-weight: 400;
	font-style: normal;
	font-display: swap;
}

:root {
	--font-primary: 'My custom font', sans-serif;
}
```

## On Storybook

Storybook uses a specific framework that works for Next.js applications. We can then easily use any Next.js function within Storybook context (like `next/font` for example).<br />
[See Storybook for Next.js documentation for more infos](https://storybook.js.org/docs/get-started/nextjs)

### Define Your Fonts using next/font

You can define your fonts in the `.storybook/preview.tsx` file the exact same way you've defined them on Next.js `layout.tsx` file.<br />
Instead of loading the fonts on the `html` tag, load them on the `div` wrapper of the Stories default decorator :

```tsx
	decorators: [
		(Story) => {
			return (
				<div
					className={`${inter.variable} ${myCustomFont.variable}`}
				>
					<Story />
				</div>
			);
		},
	],
```
