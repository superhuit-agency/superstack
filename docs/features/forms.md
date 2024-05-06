# Forms

> To create Forms with the use of Gutenberg blocks we created our own plugin : `Starterpack Forms`. This plugin requires [Advanced Custom Fields PRO](https://www.advancedcustomfields.com/pro/) to be installed.

Here are the steps to follow to handle Forms on your site :

1. Activate `Starterpack Forms` WP plugin (and `Advanced Custom Fields PRO`).
2. Register your site in [hCaptcha](https://dashboard.hcaptcha.com/welcome) in order to set `WORDPRESS_HCAPTCHA_SECRET` and `NEXT_PUBLIC_HCAPTCHA_KEY` variables -- otherwise the form won't send.
3. Set `WORDPRESS_FORMS_SECRET` variable (by default its value is equal to `spck` but you can change it)
4. Specify the "**Send to**" and "**Send from**" emails in Forms > Settings on WP admin.

> Note: On local, the emails may not be able to be sent, which will lead to a global error when submitting a form. See the [Debug emails](../setup/wordpress-guides.md#email) guide to test it locally.
