<?php

/**
 * Migration: Move member contact fields into ACF group
 *
 * The phone, email and website fields were moved from top-level ACF fields
 * into a "Coordonnées" group named `contact`. This migration renames the
 * existing meta keys to match the new group prefix and inserts the group
 * meta rows expected by ACF.
 *
 * Related commits:
 *   - 862bcf249d6138eadbe3dcd0182adb9564f46ca3 (adapt member acf fields)
 *   - 75c7d0ce7a71cce467d1b95ec1fb7a775db8ec78 (fix group name)
 *
 * @package Superstack
 * @since   1.0.0
 */

if (! defined('ABSPATH')) {
	exit;
}

return [
	// Rename value meta keys: {field} → contact_{field}
	"db query \"UPDATE wp_postmeta pm INNER JOIN wp_posts p ON pm.post_id = p.ID SET pm.meta_key = 'contact_phone' WHERE p.post_type = 'member' AND pm.meta_key = 'phone'\"",
	"db query \"UPDATE wp_postmeta pm INNER JOIN wp_posts p ON pm.post_id = p.ID SET pm.meta_key = 'contact_email' WHERE p.post_type = 'member' AND pm.meta_key = 'email'\"",
	"db query \"UPDATE wp_postmeta pm INNER JOIN wp_posts p ON pm.post_id = p.ID SET pm.meta_key = 'contact_website' WHERE p.post_type = 'member' AND pm.meta_key = 'website'\"",

	// Rename reference meta keys: _{field} → _contact_{field}
	"db query \"UPDATE wp_postmeta pm INNER JOIN wp_posts p ON pm.post_id = p.ID SET pm.meta_key = '_contact_phone' WHERE p.post_type = 'member' AND pm.meta_key = '_phone'\"",
	"db query \"UPDATE wp_postmeta pm INNER JOIN wp_posts p ON pm.post_id = p.ID SET pm.meta_key = '_contact_email' WHERE p.post_type = 'member' AND pm.meta_key = '_email'\"",
	"db query \"UPDATE wp_postmeta pm INNER JOIN wp_posts p ON pm.post_id = p.ID SET pm.meta_key = '_contact_website' WHERE p.post_type = 'member' AND pm.meta_key = '_website'\"",

	// Insert group meta rows (contact + _contact) for each member post
	"db query \"INSERT INTO wp_postmeta (post_id, meta_key, meta_value) SELECT p.ID, 'contact', '' FROM wp_posts p WHERE p.post_type = 'member' AND NOT EXISTS (SELECT 1 FROM wp_postmeta pm WHERE pm.post_id = p.ID AND pm.meta_key = 'contact')\"",
	"db query \"INSERT INTO wp_postmeta (post_id, meta_key, meta_value) SELECT p.ID, '_contact', 'field_6991d9df203ff' FROM wp_posts p WHERE p.post_type = 'member' AND NOT EXISTS (SELECT 1 FROM wp_postmeta pm WHERE pm.post_id = p.ID AND pm.meta_key = '_contact')\"",
];
