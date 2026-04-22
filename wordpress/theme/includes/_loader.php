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
 * Load Helpers.
 */
require_once __DIR__ . '/helpers/array-find.php';
require_once __DIR__ . '/helpers/get-remote-json.php';
require_once __DIR__ . '/helpers/relative-site-urls.php';
require_once __DIR__ . '/helpers/get-next-url.php';
require_once __DIR__ . '/helpers/get-image-attr.php';
require_once __DIR__ . '/helpers/get-primary-term.php';
require_once __DIR__ . '/helpers/get-rewrite-query.php';
require_once __DIR__ . '/helpers/setting-fields.php';

/**
 * Load post types.
 */
require_once __DIR__ . '/post-types/post.php';
// require_once __DIR__ . '/post-types/custom-post-type.php';

/**
 * Load admin classes.
 */
require_once __DIR__ . '/admin/index.php';
require_once __DIR__ . '/admin/font-mime-types.php';
require_once __DIR__ . '/admin/hide-update-notice.php';
require_once __DIR__ . '/admin/next-url-option.php';
require_once __DIR__ . '/admin/polylang-defaults.php';
require_once __DIR__ . '/admin/sitemap-exclude-user.php';
require_once __DIR__ . '/admin/template-redirect-preview.php';

/**
 * Load GraphQL classes.
 */
require_once __DIR__ . '/graphql/graphql-endpoint-script.php';
require_once __DIR__ . '/graphql/navigation-inner-blocks.php';
require_once __DIR__ . '/graphql/node-idtype.php';
require_once __DIR__ . '/graphql/post-edit-link.php';
require_once __DIR__ . '/graphql/query-pagination-offset.php';
require_once __DIR__ . '/graphql/register-fse-templates.php';
require_once __DIR__ . '/graphql/register-logo.php';
require_once __DIR__ . '/graphql/resolve-uris.php';

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
