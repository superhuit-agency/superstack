<?php

namespace Superstack\Admin\NextjsRevalidate;

add_filter('nextjs_revalidate_should_revalidate_post', __NAMESPACE__ . '\skip_theme_post_types', 10, 2);
add_filter('nextjs_revalidate_site_setting_options', __NAMESPACE__ . '\add_reading_settings');
add_action('save_post_wp_block', __NAMESPACE__ . '\report_synced_pattern_users');
add_action('deleted_post', __NAMESPACE__ . '\report_deleted_synced_pattern_users', 10, 2);

/**
 * Don't report a block menu (`wp_navigation`), a template (`wp_template`) or a
 * template part (`wp_template_part`) as a `post` change.
 *
 * The theme makes these types public to expose them to WPGraphQL
 * (see `graphql/navigation-inner-blocks.php` and
 * `graphql/register-fse-templates.php`), so the plugin would also report each
 * save as a post, clearing every listing. The plugin already reports a menu
 * as a `menu` change, and a template or a template part as a `templates`
 * change.
 *
 * @param bool $should_revalidate Whether the post is revalidated.
 * @param int  $post_id           The post ID.
 * @return bool
 */
function skip_theme_post_types($should_revalidate, $post_id) {
	if (in_array(get_post_type($post_id), ['wp_navigation', 'wp_template', 'wp_template_part'], true)) {
		return false;
	}

	return $should_revalidate;
}

/**
 * Report Settings › Reading's front page and posts page as a `settings`
 * change: every public node read that finds a node carries the `settings`
 * tag, a cached 404 doesn't. A stopgap the plugin's ADR 0037 rules out,
 * until nextjs-revalidate#172 (see docs/caching.md › Options that move URIs).
 *
 * @param string[] $options The site setting options.
 * @return string[]
 */
function add_reading_settings($options) {
	if (! is_array($options)) {
		return $options;
	}

	return array_merge($options, ['show_on_front', 'page_on_front', 'page_for_posts']);
}

/**
 * Report the posts and templates that use a synced pattern (`wp_block`) when
 * it's saved, trashed or restored (`save_post_wp_block`).
 *
 * WPGraphQL Gutenberg inlines a pattern's content into the `blocksJSON` of
 * whatever uses it, so the front-end caches it inside the node read of each
 * post, and inside the templates read for a template or a template part. A
 * pattern isn't viewable, so the plugin reports nothing for it.
 *
 * Revisions and autosaves are `revision` posts: they never reach this hook.
 *
 * @param int $pattern_id The synced pattern's post ID.
 * @return void
 */
function report_synced_pattern_users($pattern_id) {
	if (! function_exists('nextjs_revalidate_post')) {
		return;
	}

	$users = find_synced_pattern_users((int) $pattern_id);

	foreach ($users['posts'] as $post_id) {
		nextjs_revalidate_post($post_id);
	}

	if ($users['templates']) {
		report_templates();
	}
}

/**
 * Report the users of a synced pattern that was permanently deleted: their
 * `blocksJSON` no longer holds its content. Trashing it is a save.
 *
 * @param int           $post_id The deleted post's ID.
 * @param \WP_Post|null $post    The deleted post.
 * @return void
 */
function report_deleted_synced_pattern_users($post_id, $post = null) {
	if ($post instanceof \WP_Post && 'wp_block' === $post->post_type) {
		report_synced_pattern_users($post_id);
	}
}

/**
 * The published or private posts, templates and template parts that use a
 * synced pattern, directly or through patterns that nest it.
 *
 * A `LIKE` on `post_content` narrows the candidates, then each one's blocks
 * are parsed to keep those with a `core/block` whose `ref` is the pattern:
 * `"ref":12` also matches `"ref":123`, and `core/navigation` has a `ref` too.
 * The `LIKE` scans the posts table, which is fine for an edit as rare as a
 * pattern save; one more query per level of nesting.
 *
 * @param int $pattern_id The synced pattern's post ID.
 * @return array{posts: int[], templates: bool} The IDs of the posts using it,
 *                                                and whether a template or a
 *                                                template part does.
 */
function find_synced_pattern_users($pattern_id) {
	global $wpdb;

	$posts     = [];
	$templates = false;
	$seen      = [$pattern_id => true];
	$refs      = [$pattern_id];

	while (! empty($refs)) {
		$ref_likes = implode(' OR ', array_fill(0, count($refs), 'post_content LIKE %s'));
		$ref_args  = array_map(fn($ref) => '%' . $wpdb->esc_like('"ref":' . $ref) . '%', $refs);

		$candidates = $wpdb->get_results($wpdb->prepare(
			"SELECT ID, post_type, post_content FROM {$wpdb->posts}
			WHERE post_type <> 'revision'
			AND post_status IN ('publish', 'private')
			AND post_content LIKE %s
			AND ($ref_likes)",
			'%' . $wpdb->esc_like('<!-- wp:block ') . '%',
			...$ref_args
		));

		$nested = [];

		foreach ($candidates as $candidate) {
			if (! blocks_use_patterns(parse_blocks($candidate->post_content), $refs)) {
				continue;
			}

			$id = (int) $candidate->ID;

			if ('wp_block' === $candidate->post_type) {
				if (! isset($seen[$id])) {
					$seen[$id] = true;
					$nested[]  = $id;
				}
			} elseif (in_array($candidate->post_type, ['wp_template', 'wp_template_part'], true)) {
				$templates = true;
			} else {
				$posts[$id] = $id;
			}
		}

		$refs = $nested;
	}

	return ['posts' => array_values($posts), 'templates' => $templates];
}

/**
 * Whether any of the blocks, at any depth, is one of the synced patterns.
 *
 * @param array[] $blocks Parsed blocks.
 * @param int[]   $refs   Synced pattern IDs.
 * @return bool
 */
function blocks_use_patterns($blocks, $refs) {
	foreach ($blocks as $block) {
		if (
			'core/block' === $block['blockName']
			&& in_array((int) ($block['attrs']['ref'] ?? 0), $refs, true)
		) {
			return true;
		}

		if (! empty($block['innerBlocks']) && blocks_use_patterns($block['innerBlocks'], $refs)) {
			return true;
		}
	}

	return false;
}

/**
 * Report a `templates` change into the request's pending changes, as the
 * plugin's own `FseSnapshot` does: the plugin has no public function for it.
 *
 * @return void
 */
function report_templates() {
	if (! class_exists('\NextJsRevalidate') || ! class_exists('\NextJsRevalidate\Change')) {
		return;
	}

	\NextJsRevalidate::init()->pendingChanges->report(\NextJsRevalidate\Change::templates());
}
