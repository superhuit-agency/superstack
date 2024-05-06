<?php
/**
 * GLOBAL CONSTANTS
 */
$theme = wp_get_theme();
define( 'THEME_NAME'   , $theme['Name'] );
define( 'THEME_VERSION', $theme['Version'] );
define( 'THEME_PATH'   , get_stylesheet_directory() );
define( 'THEME_URI'    , get_stylesheet_directory_uri() );

/**
 * REQUIREMENTS
 */

// This is where the magic happens
require_once __DIR__ . '/lib/_loader.php';


/**
 * SETUP & INIT
 */
// Initialize theme
new SuptTheme();


// Email debugging
// if (WP_DEBUG) {
// 	add_action( 'phpmailer_init', function ( $phpmailer ) {
// 		$phpmailer->Host = 'smtp.mailtrap.io';
// 		$phpmailer->SMTPAuth = true;
// 		$phpmailer->Port = 2525;
// 		$phpmailer->Username = 'FILL_ME';
// 		$phpmailer->Password = 'FILL_ME';
// 	} );

// 	// PHPmailer was failing to send mails
// 	// from `wordpress@localhost` address
// 	add_filter( 'wp_mail_from', function($from) {
// 		return "wordpress@superstack.dev";
// 	});
// }

