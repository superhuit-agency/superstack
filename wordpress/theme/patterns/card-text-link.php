<?php

/**
 * Title: Carte de texte avec lien
 * Slug: superstack/card-text-link
 * Categories: text,call-to-action
 * Description: Afficher une carte avec un titre et un texte et un lien.
 * Post Types: page
 * Viewport width: 320
 *
 * @package    Superstack
 * @subpackage Superstack/patterns
 * @since      1.0.0
 */

?>

<!-- wp:group {"className":"spck-card-text-link","metadata":{"name":"Carte de texte avec lien"}, "style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}}},"layout":{"type":"constrained"},"allowedBlocks":[]} -->
<div class="wp-block-group spck-card-text-link" style="padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)">
	<!-- wp:group {"layout":{"type":"flex","orientation":"vertical"},"templateLock":"all","lock":{"remove":true,"move":true},"allowedBlocks":[]} -->
	<div class="wp-block-group">
		<!-- wp:heading {"level":3} -->
		<h3 class="wp-block-heading">Pair-Aidance</h3>
		<!-- /wp:heading -->

		<!-- wp:group {"spacing":{"blockGap":"var:preset|spacing|40"},"layout":{"type":"flex","orientation":"vertical"},"templateLock":"all","lock":{"remove":true,"move":true},"allowedBlocks":[]} -->
		<div class="wp-block-group">
			<!-- wp:paragraph {"fontSize":"large"} -->
			<p class="has-large-font-size">Découvrez ce qu’est la pair-aidance, notre centre de compétence et nos prestations</p>
			<!-- /wp:paragraph -->

			<!-- wp:buttons -->
			<div class="wp-block-buttons">
				<!-- wp:button {"className":"is-style-link"} -->
				<div class="wp-block-button is-style-link"><a href="#" class="wp-block-button__link wp-element-button">En savoir plus</a></div>
				<!-- /wp:button -->
			</div>
			<!-- /wp:buttons -->
		</div>
		<!-- /wp:group -->
	</div>
	<!-- /wp:group -->
</div>
<!-- /wp:group -->
