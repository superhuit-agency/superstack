<?php

namespace Superstack;

/**
 * The secret sent to the Next.js preview route, which must match the
 * front-end's `WORDPRESS_PREVIEW_SECRET`. Read from the environment, or from
 * a `WORDPRESS_PREVIEW_SECRET` constant (wp-config.php).
 *
 * Without one, the local default `spck` is sent. Unlike the front-end, which
 * refuses every preview when it has no secret, this fallback opens nothing:
 * a front-end configured with a real secret refuses `spck`.
 *
 * @return string
 */
function get_preview_secret() {
	if (!empty($_ENV['WORDPRESS_PREVIEW_SECRET'])) {
		return $_ENV['WORDPRESS_PREVIEW_SECRET'];
	}

	if (defined('WORDPRESS_PREVIEW_SECRET') && !empty(WORDPRESS_PREVIEW_SECRET)) {
		return WORDPRESS_PREVIEW_SECRET;
	}

	return 'spck';
}
