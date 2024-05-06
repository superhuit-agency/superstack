<?php

namespace SUPT\Taxonomies;

use WPGraphQL\Data\Connection\TermObjectConnectionResolver;
use function SUPT\get_rewrite_query;

abstract class TaxonomyWithArchive extends Taxonomy {

	// const LINKED_POST_TYPE_NAME = '';

	abstract function getGraphQLTaxonomyName();
	abstract function getLinkedPostTypeName();

	/**
	 * Bind all you action & filter hooks in here.
	 */
	function __construct() {
		parent::__construct();

		add_action( 'init',  [$this, 'add_rewrite_category'], 20 );
		add_action( 'init', [ $this, 'customize_permastruct' ] );

		add_action( 'graphql_register_types', [ $this, 'graphql_register_category_to_archive_filters' ] );
	}

	/**
	 * Register a connection between ArchiveFiltersFieldsType to Categories
	 * in order to retrieve categories for the current archive page
	 */
	function graphql_register_category_to_archive_filters() {
		register_graphql_connection([
			'fromType'      => 'ArchiveFiltersFieldsType',
			'toType'        => $this->getGraphQLTaxonomyName(),
			'queryClass'    => 'WP_Term_Query',
			'fromFieldName' => $this->getPluralName(),
			'resolve'       => function( $source, $args, $context, $info ) {
				global $wp;

				$resolver = new TermObjectConnectionResolver( $source, $args, $context, $info, $this->getName() );
				$resolver->set_query_arg( 'hide_empty', true );
				$resolver->set_query_arg( 'number', 0 );

				// TODO: maybe move to i18n plugin
				if ( !empty($wp->query_vars['lang']) ) {
					$resolver->set_query_arg( 'lang', $wp->query_vars['lang'] );
				}

				return $resolver->get_connection();
			},
		]);
	}


	/**
	 * Prepend the archive_name before category_name to the permastruct
	 */
	function customize_permastruct() {
		global $post_types;

		if(!isset($post_types)) return; // Bail early if $post_types isn't defined

		$tax = get_taxonomy( $this->getName() );
		$category_slug = $tax->rewrite['slug'] ?? $tax->rewrite ?? $tax->name;
		$archive_link = $post_types[$this->getLinkedPostTypeName()]->get_archive_page_url();

		add_permastruct( $this->getName(), $archive_link. '/' . $category_slug.'/%'.$this->getName().'%', array('with_front' => false) );
	}

	function add_rewrite_category() {
		global $wp_rewrite, $post_types;

		if(!isset($post_types)) return; // Bail early if $post_types isn't defined

		if ( function_exists('pll_the_languages') ) {
			$languages = pll_the_languages(array( 'raw' => 1 ));
		}
		$languages_codes = implode('|', array_keys($languages ?? []));

		$replacements = [
			'%lang%' 																								=> [ 'regex' => '('.$languages_codes.')', 	'matchIndex' 	=> 1 ],
			'%'.$this->getLinkedPostTypeName().'_archive_pagename%' => [ 'regex' => '(.?.+?)',     				'matchIndex'  => 2 ],
			'%'.$this->getName().'%' 						 										=> [ 'regex' => '([^/]+)',     				'matchIndex'  => 3 ],
			'%paged%'                   	 													=> [ 'regex' => '([0-9]{1,})', 				'matchIndex'  => 4 ],
		];

		$tax = get_taxonomy( $this->getName() );
		$category_slug = $tax->rewrite['slug'] ?? $tax->rewrite ?? $tax->name;

		$archive_page_slug   = $post_types[$this->getLinkedPostTypeName()]->get_archive_page_url();

		// Fix when starting WP server
		if(empty($archive_page_slug)) {
			$archive_page_slug = '';
		}

		$permastruct       = "%lang%/$archive_page_slug/$category_slug/%".$this->getName()."%/?$";
		$paged_permastruct = "%lang%/$archive_page_slug/$category_slug/%".$this->getName()."%/{$wp_rewrite->pagination_base}/?%paged%/?$";
		$rewrite           = str_replace( array_keys($replacements), array_values(array_column($replacements, 'regex')), $permastruct );
		$paged_rewrite     = str_replace( array_keys($replacements), array_values(array_column($replacements, 'regex')), $paged_permastruct );

		add_rewrite_rule( $rewrite, get_rewrite_query($permastruct, $replacements), 'top' );
		add_rewrite_rule( $paged_rewrite, get_rewrite_query($paged_permastruct, $replacements), 'top' );
	}

}
