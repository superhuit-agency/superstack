<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Cookie_Analytics_API {

	public function __construct() {
		add_action( 'rest_api_init', [ $this, 'register_routes' ] );
	}

	/**
	 * Register REST API routes.
	 */
	public function register_routes() {
		register_rest_route( 'supt/v1', '/cookie-stats', [
			'methods'             => 'POST',
			'callback'            => [ $this, 'record_event' ],
			'permission_callback' => '__return_true', // Public endpoint
			'args'                => [
				'event_type' => [
					'required'          => true,
					'type'              => 'string',
					'enum'              => [ 'impression', 'accept', 'reject', 'personalize' ],
					'sanitize_callback' => 'sanitize_text_field',
				],
			],
		] );
	}

	/**
	 * Known bot User-Agent patterns (case-insensitive substrings).
	 */
	private const BOT_PATTERNS = [
		'bot',
		'crawl',
		'spider',
		'slurp',
		'googlebot',
		'bingbot',
		'yandexbot',
		'baiduspider',
		'duckduckbot',
		'facebookexternalhit',
		'facebot',
		'ia_archiver',
		'semrushbot',
		'ahrefsbot',
		'dotbot',
		'rogerbot',
		'linkedinbot',
		'embedly',
		'quora link preview',
		'showyoubot',
		'outbrain',
		'pinterest',
		'applebot',
		'twitterbot',
		'whatsapp',
		'telegrambot',
		'screaming frog',
		'lighthouse',
		'chrome-lighthouse',
		'pagespeed',
		'headlesschrome',
		'phantomjs',
		'prerender',
		'wget',
		'curl',
		'python-requests',
		'go-http-client',
		'apache-httpclient',
		'http_request',
		'node-fetch',
		'axios',
		'uptimerobot',
		'pingdom',
		'statuscake',
		'gptbot',
		'chatgpt',
		'claudebot',
		'anthropic',
		'bytespider',
		'petalbot',
		'mj12bot',
	];

	/**
	 * Handle incoming event tracking requests.
	 *
	 * @param WP_REST_Request $request
	 * @return WP_REST_Response
	 */
	public function record_event( $request ) {
		$event_type = $request->get_param( 'event_type' );

		// Bot detection: skip known bots
		if ( $this->is_bot( $request ) ) {
			return new WP_REST_Response( [ 'success' => true, 'skipped' => true ], 200 );
		}

		$ip = $this->get_visitor_ip( $request );

		// Check IP blacklist
		if ( $ip && Cookie_Analytics_DB::is_ip_blacklisted( $ip ) ) {
			return new WP_REST_Response( [ 'success' => true, 'skipped' => true ], 200 );
		}

		$result = Cookie_Analytics_DB::insert_event( $event_type );

		if ( false === $result ) {
			return new WP_REST_Response(
				[ 'success' => false, 'message' => 'Invalid event type.' ],
				400
			);
		}

		return new WP_REST_Response( [ 'success' => true ], 200 );
	}

	/**
	 * Detect if the request comes from a known bot based on User-Agent.
	 *
	 * @param WP_REST_Request $request
	 * @return bool True if the request is from a bot.
	 */
	private function is_bot( $request ) {
		$ua = $request->get_header( 'User-Agent' );

		// No User-Agent at all is suspicious — likely a script/bot
		if ( empty( $ua ) ) {
			return true;
		}

		$ua_lower = strtolower( $ua );

		foreach ( self::BOT_PATTERNS as $pattern ) {
			if ( strpos( $ua_lower, $pattern ) !== false ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Get the real visitor IP address.
	 * Checks multiple headers in priority order to support various
	 * proxy setups (Next.js proxy, nginx, Docker, load balancers).
	 *
	 * @param WP_REST_Request $request
	 * @return string|null
	 */
	private function get_visitor_ip( $request ) {
		// Headers to check, in priority order
		$headers = [
			'X-Forwarded-For',      // Standard proxy header (Next.js proxy, nginx, etc.)
			'X-Real-Ip',            // nginx real IP
			'CF-Connecting-IP',     // Cloudflare
			'True-Client-IP',       // Akamai / Cloudflare Enterprise
			'X-Client-IP',          // Some load balancers
		];

		foreach ( $headers as $header ) {
			$value = $request->get_header( $header );
			if ( ! empty( $value ) ) {
				// X-Forwarded-For can contain multiple IPs; first is the client
				$ip = trim( explode( ',', $value )[0] );
				if ( $ip ) {
					return $ip;
				}
			}
		}

		// Also check $_SERVER directly for headers that WP_REST_Request may not expose
		$server_headers = [
			'HTTP_X_FORWARDED_FOR',
			'HTTP_X_REAL_IP',
			'HTTP_CF_CONNECTING_IP',
			'HTTP_TRUE_CLIENT_IP',
			'HTTP_X_CLIENT_IP',
		];

		foreach ( $server_headers as $header ) {
			if ( ! empty( $_SERVER[ $header ] ) ) {
				$ip = trim( explode( ',', $_SERVER[ $header ] )[0] );
				if ( $ip ) {
					return $ip;
				}
			}
		}

		// Final fallback to REMOTE_ADDR
		return $_SERVER['REMOTE_ADDR'] ?? null;
	}
}
