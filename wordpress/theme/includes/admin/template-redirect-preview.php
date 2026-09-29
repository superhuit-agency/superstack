<?php

namespace Superstack\PreviewRedirect;

use WPGraphQL\JWT_Authentication\Auth;
use function Superstack\get_next_url;

add_action('template_redirect', __NAMESPACE__ . '\redirect_preview_to_next', 1);

function redirect_preview_to_next() {
    if (is_admin() || wp_doing_ajax()) return;

    if (!is_user_logged_in()) return;

    $next_url = get_next_url();

    $token = Auth::get_refresh_token(wp_get_current_user());

    // The posts page has no resolvable uri in WPGraphQL, so redirect with its uri instead of its id
    if (is_home()) {
        $uri = $_SERVER['REQUEST_URI'] ?? '';

        if (empty($uri)) return;

        wp_safe_redirect(add_query_arg(['secret' => 'spck', 'uri' => $uri, 'token' => $token], $next_url . "/api/preview/"));
        exit;
    }

    // Redirect to Next.js preview url
    $id = get_queried_object_id();

    if (empty($id)) return;

    // generate a rest nonce to allow Next to authenticate
    // requests made to the REST API
    $rest_nonce = wp_create_nonce('wp_rest');

    $draft_preview = (true == get_query_var('preview'));

    wp_safe_redirect($next_url . "/api/preview/?secret=spck&id=$id&token=$token&nonce=$rest_nonce" . ($draft_preview ? "&draft=true" : ""));
    exit;
}
