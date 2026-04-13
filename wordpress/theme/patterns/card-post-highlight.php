<?php

/**
 * Title: Carte d'article mis en avant
 * Slug: superstack/card-post-highlight
 * Categories: posts
 * Description: Afficher une carte d'article ou un événement mis en avant.
 * Viewport width: 640
 *
 * @package    Superstack
 * @subpackage Superstack/patterns
 * @since      1.0.0
 */

?>
<!-- wp:group {"tagName":"article","metadata":{"name":"Carte d'article mis en avant"},"className":"spck-card-post -highlight","layout":{"type":"flex","orientation":"vertical"},"allowedBlocks":[]} -->
<article class="wp-block-group spck-card-post -highlight">
	<!-- wp:group {"templateLock":"all","lock":{"move":true,"remove":true},"className":"spck-card-post__top","style":{"spacing":{"padding":{"top":"var:preset|spacing|20","bottom":"var:preset|spacing|20","left":"var:preset|spacing|20","right":"var:preset|spacing|20"}}},"layout":{"type":"flex","flexWrap":"nowrap"},"allowedBlocks":[]} -->
	<div class="wp-block-group spck-card-post__top" style="padding-top:var(--wp--preset--spacing--20);padding-right:var(--wp--preset--spacing--20);padding-bottom:var(--wp--preset--spacing--20);padding-left:var(--wp--preset--spacing--20)">
		<!-- wp:post-date {"fontSize":"small"} /-->
	</div>
	<!-- /wp:group -->

	<!-- wp:group {"className":"spck-card-post__body","style":{"spacing":{"padding":{"top":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|30","right":"var:preset|spacing|30"},"blockGap":"var:preset|spacing|60"}},"layout":{"type":"flex","flexWrap":"nowrap"},"allowedBlocks":[]} -->
	<div class="wp-block-group spck-card-post__body" style="padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30)">
		<!-- wp:group {"templateLock":"all","lock":{"move":true,"remove":true},"className":"spck-card-post__inner","style":{"spacing":{"blockGap":"var:preset|spacing|50"}},"layout":{"type":"flex","orientation":"vertical"},"allowedBlocks":[]} -->
		<div class="wp-block-group spck-card-post__inner">
			<!-- wp:group {"className":"spck-card-post__content","style":{"spacing":{"blockGap":"var:preset|spacing|20"}},"layout":{"type":"constrained"},"allowedBlocks":[]} -->
			<div class="wp-block-group spck-card-post__content">
				<!-- wp:post-title {"isLink":true,"fontSize":"x-large"} /-->
				<!-- wp:post-excerpt {"excerptLength":100, "fontSize":"large"} /-->
			</div>
			<!-- /wp:group -->

			<!-- wp:read-more {"content":"En savoir plus"} /-->
		</div>
		<!-- /wp:group -->

		<!-- wp:post-featured-image {"aspectRatio":"4/3","isLink":false} /-->
	</div>
	<!-- /wp:group -->

</article>
<!-- /wp:group -->
