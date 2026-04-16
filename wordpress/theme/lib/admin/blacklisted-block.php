<?php

namespace SUPT\Admin;

add_filter('allowed_block_types_all', __NAMESPACE__ . '\\filter_blacklisted_blocks', 100, 2);

function filter_blacklisted_blocks($allowed_blocks) {
    // Get all registered blocks first
	$all_blocks = array_keys(\WP_Block_Type_Registry::get_instance()->get_all_registered());

    $blacklisted_blocks = [
        'core/archives',
        'core/calendar',
        'core/rss',
        'core/search',
        'core/shortcode',
        'core/tag-cloud',
        'core/page-list',
        'core/comments',
        'core/post-comment',
        'core/post-comments-count',
        'core/post-comments-form',
        'core/post-comments-link',
    ];

    return array_values(array_diff($all_blocks, $blacklisted_blocks));
}