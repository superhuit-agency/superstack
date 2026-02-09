<?php
/**
 * Plugin Name: Cookie Analytics
 * Description: Track and analyze GDPR cookie banner interactions (impressions, accepts, rejects, personalizations).
 * Version: 1.0.0
 * Author: Superstack
 * Text Domain: cookie-analytics
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'COOKIE_ANALYTICS_VERSION', '1.0.0' );
define( 'COOKIE_ANALYTICS_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'COOKIE_ANALYTICS_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

// Includes
require_once COOKIE_ANALYTICS_PLUGIN_DIR . 'includes/class-cookie-analytics-db.php';
require_once COOKIE_ANALYTICS_PLUGIN_DIR . 'includes/class-cookie-analytics-api.php';
require_once COOKIE_ANALYTICS_PLUGIN_DIR . 'includes/class-cookie-analytics-admin.php';

/**
 * Activation hook: create database tables and schedule cleanup.
 */
function cookie_analytics_activate() {
	Cookie_Analytics_DB::create_tables();
	if ( ! wp_next_scheduled( 'cookie_analytics_daily_cleanup' ) ) {
		wp_schedule_event( time(), 'daily', 'cookie_analytics_daily_cleanup' );
	}
}
register_activation_hook( __FILE__, 'cookie_analytics_activate' );

/**
 * Deactivation hook: clear scheduled cleanup.
 */
function cookie_analytics_deactivate() {
	wp_clear_scheduled_hook( 'cookie_analytics_daily_cleanup' );
}
register_deactivation_hook( __FILE__, 'cookie_analytics_deactivate' );

/**
 * Daily cleanup: delete events older than the retention period.
 */
function cookie_analytics_run_cleanup() {
	$days = Cookie_Analytics_DB::get_retention_days();
	if ( $days > 0 ) {
		Cookie_Analytics_DB::delete_events_older_than( $days );
	}
}
add_action( 'cookie_analytics_daily_cleanup', 'cookie_analytics_run_cleanup' );

/**
 * Initialize plugin components.
 */
function cookie_analytics_init() {
	new Cookie_Analytics_API();
	if ( is_admin() ) {
		new Cookie_Analytics_Admin();
	}
}
add_action( 'plugins_loaded', 'cookie_analytics_init' );
