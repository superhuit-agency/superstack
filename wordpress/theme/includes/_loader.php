<?php

namespace Superstack;

if (! defined('ABSPATH')) {
	exit;
}

/**
 * Includes necessary files
 *
 * @package Superstack
 * @since 1.0.0
 */


/**
 * Load traits.
 */
require_once __DIR__ . '/traits/singleton.php';


/**
 * Load post types.
 */
require_once __DIR__ . '/post-types/post.php';
// require_once __DIR__ . '/post-types/custom-post-type.php';

/**
 * Load admin classes.
 */
require_once __DIR__ . '/admin/index.php';
require_once __DIR__ . '/admin/sitemap-exclude-user.php';


/**
 * Load editor classes.
 */
require_once __DIR__ . '/admin/editor/index.php';
require_once __DIR__ . '/admin/editor/remote-block-patterns.php';
require_once __DIR__ . '/admin/editor/unregister-default-patterns.php';
require_once __DIR__ . '/admin/editor/register-block-styles.php';
require_once __DIR__ . '/admin/editor/register-block-categories.php';

/**
 * Load blocks classes.
 */
require_once __DIR__ . '/blocks/core-group.php';

/**
 * Load public classes.
 */
require_once __DIR__ . '/public/index.php';
require_once __DIR__ . '/public/next-redirect.php';

/**
 * Load CLI commands.
 */
require_once __DIR__ . '/cli/migrations.php';
