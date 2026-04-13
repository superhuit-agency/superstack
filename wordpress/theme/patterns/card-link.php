<?php

/**
 * Title: Carte de lien
 * Slug: superstack/card-link
 * Categories: call-to-action
 * Description: Afficher une carte avec un lien.
 * Post Types: page
 * Viewport width: 320
 *
 * @package    Superstack
 * @subpackage Superstack/patterns
 * @since      1.0.0
 */

?>

<!-- wp:group {"className":"spck-card-link","metadata":{"name":"Carte de lien"}, "style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}}},"layout":{"type":"constrained"},"allowedBlocks":[]} -->
<div class="wp-block-group spck-card-link" style="padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)">
	<!-- wp:group {"layout":{"type":"flex","orientation":"vertical"},"templateLock":"all","lock":{"remove":true,"move":true},"allowedBlocks":[]} -->
	<div class="wp-block-group">
		<!-- wp:heading {"level":3} -->
		<h3 class="wp-block-heading">Plaquette de présentation</h3>
		<!-- /wp:heading -->

		<!-- wp:buttons -->
		<div class="wp-block-buttons">
			<!-- wp:button {"className":"is-style-link"} -->
			<div class="wp-block-button is-style-link"><a href="#" class="wp-block-button__link wp-element-button" target="_blank" rel="noreferrer noopener">Télécharger</a></div>
			<!-- /wp:button -->
		</div>
		<!-- /wp:buttons -->
	</div>
	<!-- /wp:group -->
</div>
<!-- /wp:group -->
