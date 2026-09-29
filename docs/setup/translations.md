# Theme Translations

The WordPress admin and block editor strings of the theme are translatable with the `superstack` text domain. This document covers how to extract them, translate them and ship the translations.

## How it works

- **PHP strings** (`__()`, `_x()`, …) are loaded by `load_theme_textdomain()` in `wordpress/theme/includes/i18n.php`, from the `.mo` files.
- **Editor strings** (`__()` / `_x()` from `@wordpress/i18n`) are loaded by `wp_set_script_translations()` in `wordpress/theme/includes/admin/editor/index.php`, from the `.json` files.
- All the files live in `wordpress/theme/languages/`.

Always use the `superstack` text domain, in PHP and in the editor code.

## Workflow

1. Build the theme assets so the editor strings are extracted from `static/editor/editor.js`:

    ```sh
    npm --prefix wordpress run build
    ```

2. Extract the strings into the POT file:

    ```sh
    npm --prefix wordpress run generate:pot
    ```

3. Create or update a `{locale}.po` file per language (e.g. `fr_FR.po`) from `superstack.pot` with Poedit, Loco or any PO editor, then save the `.mo` file next to it.

4. Generate the JSON files used by the editor from every `.po` file:

    ```sh
    npm --prefix wordpress run generate:json
    ```

    It writes one `superstack-{locale}-{md5}.json` file per language, where the hash is the md5 of `static/editor/editor.js`. `--no-purge` keeps the JS strings in the `.po` files so they can be updated later.

5. Commit the `.pot`, `.po`, `.mo` and `.json` files.

Both scripts run WP-CLI (`wp`) on your machine: the `i18n` commands only read files and don't need WordPress to be running.

## Files

| Path                                                       | Role                                 |
| ---------------------------------------------------------- | ------------------------------------ |
| `wordpress/theme/includes/i18n.php`                        | Loads the PHP translations           |
| `wordpress/theme/includes/admin/editor/index.php`          | Loads the editor script translations |
| `wordpress/theme/languages/superstack.pot`                 | Strings template                     |
| `wordpress/theme/languages/{locale}.po` / `.mo`            | Translations per language            |
| `wordpress/theme/languages/superstack-{locale}-{md5}.json` | Editor translations per language     |
