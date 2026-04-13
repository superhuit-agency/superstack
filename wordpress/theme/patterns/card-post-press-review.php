<?php

/**
 * Title: Carte de revue de presse
 * Slug: superstack/card-post-press-review
 * Categories: posts
 * Description: Afficher une carte de revue de presse.
 * Viewport width: 320
 *
 * @package    Superstack
 * @subpackage Superstack/patterns
 * @since      1.0.0
 */

?>
<!-- wp:group {"tagName":"article","metadata":{"name":"Carte de revue de presse"},"className":"spck-card-post -press-review","style":{"spacing":{"blockGap":"var:preset|spacing|30"}},"layout":{"type":"flex","orientation":"vertical"},"allowedBlocks":[]} -->
<article class="wp-block-group spck-card-post -press-review">
	<!-- wp:group {"templateLock":"all","lock":{"move":true,"remove":true},"className":"spck-card-post__top","style":{"spacing":{"padding":{"top":"var:preset|spacing|20","bottom":"var:preset|spacing|20","left":"var:preset|spacing|20","right":"var:preset|spacing|20"}}},"layout":{"type":"flex","flexWrap":"nowrap"},"allowedBlocks":[]} -->
	<div class="wp-block-group spck-card-post__top" style="padding-top:var(--wp--preset--spacing--20);padding-right:var(--wp--preset--spacing--20);padding-bottom:var(--wp--preset--spacing--20);padding-left:var(--wp--preset--spacing--20)">
		<!-- wp:post-date {"fontSize":"small"} /-->
	</div>
	<!-- /wp:group -->

	<!-- wp:group {"templateLock":"all","lock":{"move":true,"remove":true},"className":"spck-card-post__inner","style":{"spacing":{"padding":{"right":"var:preset|spacing|30","left":"var:preset|spacing|30","bottom":"var:preset|spacing|40"}}},"layout":{"type":"flex","orientation":"vertical"},"allowedBlocks":[]} -->
	<div class="wp-block-group spck-card-post__inner" style="padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--30)">
		<!-- wp:group {"className":"spck-card-post__content","style":{"spacing":{"blockGap":"var:preset|spacing|20"}},"layout":{"type":"constrained"},"allowedBlocks":[]} -->
		<div class="wp-block-group spck-card-post__content">
			<!-- wp:post-title {"isLink":true,"linkTarget":"_blank"} /-->
			<!-- wp:post-excerpt /-->
		</div>
		<!-- /wp:group -->

		<!-- wp:read-more {"content":"Lire l'article","linkTarget":"_blank"} /-->
	</div>
	<!-- /wp:group -->
</article>
<!-- /wp:group -->
