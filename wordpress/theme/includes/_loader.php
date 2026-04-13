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
require_once __DIR__ . '/post-types/event.php';
require_once __DIR__ . '/post-types/post.php';
require_once __DIR__ . '/post-types/member.php';
require_once __DIR__ . '/post-types/partner.php';
require_once __DIR__ . '/post-types/press-review.php';
require_once __DIR__ . '/post-types/gallery.php';

/**
 * Load admin classes.
 */
require_once __DIR__ . '/admin/index.php';
require_once __DIR__ . '/admin/editor/index.php';
require_once __DIR__ . '/admin/editor/remote-block-patterns.php';
require_once __DIR__ . '/admin/editor/unregister-default-patterns.php';
require_once __DIR__ . '/admin/editor/register-block-styles.php';
require_once __DIR__ . '/admin/editor/register-block-categories.php';
require_once __DIR__ . '/admin/acf-options.php';
require_once __DIR__ . '/admin/acf-google-maps.php';
require_once __DIR__ . '/admin/sitemap-exclude-user.php';
require_once __DIR__ . '/admin/content-control-menu.php';

/**
 * Load blocks classes.
 */
require_once __DIR__ . '/blocks/core-query-loop/_loader.php';
require_once __DIR__ . '/blocks/core-group.php';
require_once __DIR__ . '/blocks/core-post-date.php';
require_once __DIR__ . '/blocks/section-members-map.php';

/**
 * Load public classes.
 */
require_once __DIR__ . '/public/index.php';
require_once __DIR__ . '/public/content-control-rules.php';
require_once __DIR__ . '/public/disable-forminator-select2.php';

/**
 * Load CLI commands.
 */
require_once __DIR__ . '/cli/migrations.php';
