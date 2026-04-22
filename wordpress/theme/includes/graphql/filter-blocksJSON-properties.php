<?php

namespace Superstack\GraphQL;

use Superstack\Traits\Singleton;

if (! defined('ABSPATH')) {
    exit;
}

class Filter_BlocksJSON_Properties {

use Singleton;

    public function init() {
        add_filter( 'graphql_gutenberg_blocks_json_filtered_properties', [ $this, 'filter_blocks_json_props' ] );
    }

    /**
     * Add blocksJSON properties to filter from GraphQL API
     * 
     * 
     */
    public function filter_blocks_json_props( $properties ) {
        return array_merge( 
            $properties, 
            [
                'attributesType',
                'deprecated',
                'dynamicContent',
                'example',
                'get_parent',
                'originalContent',
                'saveContent',
                'supports',
            ] 
        );
    }

}

Filter_BlocksJSON_Properties::get_instance()->init();