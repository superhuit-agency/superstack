# Favicon implementation guide

Favicons are small images that appear in the browser tab when a user visits a website.
They are also used in bookmarks and in the browser history. Favicons are important for branding and for helping users to identify your website.

> [!IMPORTANT]
> Favicon specifications evolve. Stay informed on current best practices to ensure optimal implementation.

## Best practices

### Recommended set of icons

The following set of icons is recommended:

-   `favicon.ico` : Traditional favicon file for legacy browsers
-   `apple-icon.png` : For Apple devices
-   `icon.svg` : Scalable icon file, adaptable for dark/light modes via CSS

Inside the web app manifest, the following icons are recommended:

-   `icon-192x192.png`: Standard web application icon
-   `icon-512x512.png`: High resolution web application icon

### Icons generation tools

-   [Real Favicon Generator](https://realfavicongenerator.net/)

## Implementation with Next.js

To use favicons in your project, you can add your icon files to the root of the `src/app` directory.

Images in the app should be named as follows:

-   `favicon.ico`
-   `apple-icon.png`
-   `icon.[svg|png|jpg]`
    -   if you don't want or don't have the possibility to use a SVG file and need to have different icon sizes, you can upload several icon files following the naming convention : `icon1.png`, `icon2.png`, `icon3.png`, etc.

For the web app manifest (for android deviced), you can add the following images to the `public` directory:

-   `icon-192x192.png`
-   `icon-512x512.png`

### Web app manifest configuration

To create a manifest in Next.js, you have to add a `manifest.[json|webmanifest]` file at the root of the `src/app` folder.

This is the example file provided by the boilerplate :

```json
{
	"name": "My App",
	"short_name": "My App",
	"start_url": "/",
	"display": "standalone",
	"theme_color": "#000000",
	"background_color": "#ffffff",
	"icons": [
		{
			"src": "/icon-192x192.png",
			"sizes": "192x192",
			"type": "image/png"
		},
		{
			"src": "/icon-512x512.png",
			"sizes": "512x512",
			"type": "image/png"
		}
	]
}
```

For further information, you can check the [Next.js documentation](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest).

## 🔗 Resources

-   [Favicon recommendation 2024](https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs) : A guide to modern favicon usage
-   [Next.js Icon documentation](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons#image-files-ico-jpg-png) : Official documentation for icons in Next.js
