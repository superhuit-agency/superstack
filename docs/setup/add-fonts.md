# How To Guide: Defining Fonts on the Stack

This guide details the steps for setting up fonts in Next.js, Wordpress and Storybook sides.

## Utilizing CSS Variables for Fonts

Across the stack, we use CSS variables for the fonts family. Specifically, we use `--font-primary` and `--font-secondary` as our main font variables.

## On Next.js Side

Next.js has introduced `next/font`, a new way to optimize font loading.<br />
[See Next.js documentation for more infos](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)

### Step 1: Import Custom Fonts

If you're using custom fonts that are not hosted by a third-party service (like Google Fonts), you'll need to add them to `next/src/fonts` directory.

### Step 2: Define Your Fonts using next/font

You can define your fonts in the `layout.tsx` file located at `next/src/app/`. Define your fonts as follows:

```tsx
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';

const inter = Inter({
	subsets: ['latin'],
	variable: '--font-primary',
	display: 'swap',
});

const myCustomFont = localFont({
	src: '../fonts/my-custom-font.woff2',
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

If you're using custom fonts that are not hosted by a third-party service (like Google Fonts), you'll need to copy the font files into the WordPress theme assets folder at `wordpress/theme/src/assets/fonts/`. WordPress will not pick up fonts referenced from outside the theme directory, so the files must be present here for the block editor to load them.

### Step 2: Define Your Fonts in `theme.json`

Fonts must be registered in `wordpress/theme/theme.json`. This is the WordPress-native way to declare font families and exposes them as presets to the block editor.

Add your font under `settings.typography.fontFamilies`, declaring one `fontFace` entry per weight/style. The `src` path is relative to `theme.json` and must point to the file inside `wordpress/theme/src/assets/fonts/`:

```json
{
	"settings": {
		"typography": {
			"fontFamilies": [
				{
					"name": "My custom font",
					"slug": "my-custom-font",
					"fontFamily": "My custom font, sans-serif",
					"fontFace": [
						{
							"src": [
								"file:./src/assets/fonts/my-custom-font.woff2"
							],
							"fontWeight": "400",
							"fontStyle": "normal",
							"fontFamily": "My custom font"
						}
					]
				}
			]
		}
	}
}
```

### Step 3: Set the Default Font

To use the new font as the default across the editor, set it on `styles.typography.fontFamily` using the generated preset variable (`--wp--preset--font-family--<slug>`):

```json
{
	"styles": {
		"typography": {
			"fontFamily": "var(--wp--preset--font-family--my-custom-font)"
		}
	}
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
