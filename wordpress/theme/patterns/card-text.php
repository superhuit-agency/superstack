<?php

/**
 * Title: Carte de texte
 * Slug: superstack/card-text
 * Categories: text
 * Description: Afficher une carte avec un titre et un texte.
 * Post Types: page
 * Viewport width: 320
 *
 * @package    Superstack
 * @subpackage Superstack/patterns
 * @since      1.0.0
 */

?>

<!-- wp:group {"className":"spck-card-text","metadata":{"name":"Carte de texte"}, "style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}}},"layout":{"type":"constrained"},"allowedBlocks":[]} -->
<div class="wp-block-group spck-card-text" style="padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)">
	<!-- wp:group {"layout":{"type":"flex","orientation":"vertical"},"templateLock":"all","lock":{"remove":true,"move":true},"allowedBlocks":[]} -->
	<div class="wp-block-group">
		<!-- wp:heading {"level":3} -->
		<h3 class="wp-block-heading">1999</h3>
		<!-- /wp:heading -->

		<!-- wp:paragraph {"fontSize":"large"} -->
		<p class="has-large-font-size">Année de création de la Superstack</p>
		<!-- /wp:paragraph -->
	</div>
	<!-- /wp:group -->
</div>
<!-- /wp:group -->
