<?php

namespace Superstack\GraphQL\JwtSecretKey;

if (! defined('ABSPATH')) {
	exit;
}

add_filter('graphql_jwt_auth_secret_key', __NAMESPACE__ . '\secret_key', PHP_INT_MAX);

/**
 * Key that signs GraphQL JWTs: the GRAPHQL_JWT_AUTH_SECRET_KEY constant in wp-config.php, one random key per
 * Environment, never in git. Without a usable key, JWT authentication fails closed: tokens are refused, the rest of
 * the site works. Create or rotate the key on the host (logs out JWT sessions, previews only):
 *   wp config shuffle-salts GRAPHQL_JWT_AUTH_SECRET_KEY --force
 *
 * @return string|null
 */
function secret_key()
{
	$key = defined('GRAPHQL_JWT_AUTH_SECRET_KEY') ? (string) GRAPHQL_JWT_AUTH_SECRET_KEY : '';
	// sha256 of keys that have been public: the old SuptTheme fallback, and the local one in docker-compose.yml
	$public = ['02f6455c859707de527d50ecbc4394b1ebef5fc2ca0676853a7d440cd535bd3b'];
	if (wp_get_environment_type() !== 'local') {
		$public[] = 'b787bbd1d2d39e324e49e245d981ae5a51834e9964d32aec30cd7ba368f36e2a';
	}
	if (strlen($key) < 32 || in_array(hash('sha256', $key), $public, true)) {
		return null;
	}
	return $key;
}
