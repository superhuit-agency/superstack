<?php

namespace Superstack\Public;

use Superstack\Traits\Singleton;
use WPGraphQL\JWT_Authentication\Auth;

use function SUPT\get_next_url;

if (! defined('ABSPATH')) {
	exit;
}

/**
 * Redirect front-end requests to Next.js.
 *
 * @package    Superstack
 * @subpackage Superstack/Public
 */
class Next_Redirect {
	use Singleton;

	/**
	 * Initialize the class.
	 *
	 * @access public
	 * @return void
	 */
	public function init() {
		add_action('template_redirect', [$this, 'redirect_frontend_request']);
	}

	/**
	 * Redirect requests to the Next.js app.
	 *
	 * @access public
	 * @return void
	 */
	public function redirect_frontend_request() {
		if (
			is_admin()
			|| wp_doing_ajax()
			|| wp_doing_cron()
			|| (defined('REST_REQUEST') && REST_REQUEST)
			|| (defined('WP_CLI') && WP_CLI)
		) {
			return;
		}

		$next_url = get_next_url();

		if (empty($next_url)) {
			wp_die();
		}

		if (is_user_logged_in()) {
			$preview_url = rtrim($next_url, '/') . '/api/preview/';
			$token = Auth::get_refresh_token(wp_get_current_user());

			if (is_archive()) {
				$uri = $_SERVER['REQUEST_URI'] ?? '';

				if (empty($uri)) {
					wp_die();
				}

				$location = add_query_arg(
					[
						'secret' => 'spck',
						'uri' => $uri,
						'token' => $token,
					],
					$preview_url
				);
			} else {
				$id = get_queried_object_id();

				if (empty($id)) {
					wp_die();
				}

				$location_args = [
					'secret' => 'spck',
					'id' => $id,
					'token' => $token,
					'nonce' => wp_create_nonce('wp_rest'),
				];

				if ((bool) get_query_var('preview')) {
					$location_args['draft'] = 'true';
				}

				$location = add_query_arg($location_args, $preview_url);
			}

			wp_redirect($location);
			exit;
		}

		wp_redirect($next_url);
		exit;
	}
}

Next_Redirect::get_instance()->init();