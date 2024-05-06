<?php

namespace SUPT\Admin;

// Action & filter hooks
add_action( 'admin_head', __NAMESPACE__.'\hide_update_notices', 1 );

/**
 * Hide WP update notice except for users that can update the core.
 *
 * @see https://wpmudev.com/blog/hide-the-wordpress-update-notification/
 */
function hide_update_notices() {
	if (!current_user_can('update_core')) {
		remove_action( 'admin_notices', 'update_nag', 3 );
	}
}
