<?php

/**
 * Title: Carte de galerie
 * Slug: superstack/card-gallery
 * Categories: posts
 * Description: Afficher une carte de galerie avec image mise en avant.
 * Viewport width: 320
 * Inserter: false
 *
 * @package    Superstack
 * @subpackage Superstack/patterns
 * @since      1.0.0
 */

?>
<!-- wp:group {"tagName":"article","metadata":{"name":"Carte de galerie"},"className":"spck-card-gallery","style":{"spacing":{"blockGap":"0"}},"layout":{"type":"flex","orientation":"vertical"},"allowedBlocks":[]} -->
<article class="wp-block-group spck-card-gallery">
	<!-- wp:post-featured-image {"aspectRatio":"16/9","scale":"cover","sizeSlug":"medium_large","className":"spck-card-gallery__image"} /-->

	<!-- wp:group {"templateLock":"all","lock":{"move":true,"remove":true},"className":"spck-card-gallery__inner","style":{"spacing":{"padding":{"top":"var:preset|spacing|30","right":"var:preset|spacing|30","bottom":"var:preset|spacing|40","left":"var:preset|spacing|30"}}},"layout":{"type":"flex","orientation":"vertical"},"allowedBlocks":[]} -->
	<div class="wp-block-group spck-card-gallery__inner" style="padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--30)">
		<!-- wp:group {"className":"spck-card-gallery__content","style":{"spacing":{"blockGap":"var:preset|spacing|20"}},"layout":{"type":"constrained"},"allowedBlocks":[]} -->
		<div class="wp-block-group spck-card-gallery__content">
			<!-- wp:post-date {"fontSize":"small"} /-->
			<!-- wp:post-title {"isLink":true} /-->
			<!-- wp:post-excerpt /-->
		</div>
		<!-- /wp:group -->

		<!-- wp:read-more {"content":"Voir la galerie"} /-->
	</div>
	<!-- /wp:group -->
</article>
<!-- /wp:group -->
