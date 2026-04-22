<?php

namespace Superstack\GraphQL;

use Superstack\Traits\Singleton;

if (! defined('ABSPATH')) {
    exit;
}

class GraphQL_Endpoint_Script {

    use Singleton;

    public function init() {
        add_filter('spck-localize-script', [$this, 'localize_graphql_endpoint_script']);
    }

    /**
     * Add GraphQL endpoint information to the localized script data.
     */
    public function localize_graphql_endpoint_script() {
        // Is WPGraphQL active?
        if (class_exists('WPGraphQL')) {
            $attrs['graphql'] = [
                'nonce'    => wp_create_nonce('wp_rest'),
                'endpoint' => trailingslashit(site_url()) . 'index.php?' . \WPGraphQL\Router::$route,
            ];
        }

        return $attrs;
    }
}
