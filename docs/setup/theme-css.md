# Theme CSS Generation

The Next.js app consumes a CSS file generated from the WordPress theme's global styles. This document covers what it is, how it's built, and how to refresh it locally and in CI.

## What it is

- **Output file:** `next/public/css/theme-generated.css`
- **Consumed by:** `next/src/app/layout.tsx` (loaded as a `<link rel="stylesheet">`)
- **Content:** a `:root { ... }` block of CSS custom properties exported from `wp_get_global_stylesheet(['variables'])` — i.e. every CSS variable declared in `theme.json` and the site editor's Global Styles. No selectors, no resets, only the variables.

The file must exist before Next.js builds, because the layout link is static.

## Local development

### Auto-run on dev

`npm --prefix wordpress run dev` regenerates the CSS automatically via a `predev` hook before webpack starts. If WordPress isn't reachable (e.g. you haven't run `npm start` yet), the script logs a warning and skips — webpack still starts with whatever CSS file is currently on disk.

### Manual run

```sh
WPCLI="wp @local" npm --prefix wordpress run generate:theme-css
```

Override `WPCLI` if you use a different WP-CLI target (e.g. `wp` directly, or a remote alias). The script will also fall back to a downloaded `wp-cli.phar` if `wp` is not on `PATH`.

### Underlying CLI command

```sh
wp spck theme-css
```

Registered in `wordpress/theme/includes/cli/theme-css.php`. Use this if you want to inspect the output without writing the file.

## CI / deployment

In deploy workflows the CSS is generated on the **remote** WordPress server (via SSH + `wp spck theme-css`) and downloaded to the CI runner before the Next.js build step. See [`./deployment.md`](./deployment.md) for the workflow specifics.

## Files

| Path | Role |
| --- | --- |
| `wordpress/scripts/theme-css.sh` | Shell entrypoint — invokes WP-CLI and writes the output file |
| `wordpress/theme/includes/cli/theme-css.php` | Registers the `wp spck theme-css` command |
| `next/public/css/theme-generated.css` | Generated output (consumed by Next.js) |

## Troubleshooting

- **`WordPress is not installed/reachable for the selected WPCLI target`** — WP isn't running, or your `WPCLI` value doesn't match your environment. Run `npm --prefix wordpress start` first, or set `WPCLI` explicitly (e.g. `WPCLI="wp @local"`).
- **`Skipping theme CSS generation (THEME_CSS_SOFT=1)` at the start of `npm run dev`** — the `predev` hook ran but WP wasn't reachable. Expected when WP is down; bring WP up and re-run `npm run generate:theme-css` manually if you need fresh CSS now.
- **`Generated stylesheet is empty after filtering`** — `wp_get_global_stylesheet(['variables'])` returned no `:root{` block. Check that the active theme defines variables in `theme.json` and that the site is in a healthy state.
- **CI step fails with `SSH connection refused`** — GitHub Actions runners can't reach your remote server. Check firewall/security groups.
- **CI step fails with `wp: command not found`** — WP-CLI is not installed on the remote WordPress server.
