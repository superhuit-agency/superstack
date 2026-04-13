<?php

/**
 * Title: Section À la une
 * Slug: superstack/section-latest-posts
 * Categories: posts
 * Description: Afficher une section avec les derniers articles et événements.
 *
 * @package    Superstack
 * @subpackage Superstack/patterns
 * @since      1.0.0
 */

?>
<!-- wp:group {"tagName":"section","metadata":{"name":"Section À la une"},"className":"spck-section-latest-posts","style":{"spacing":{"blockGap":"var:preset|spacing|50","padding":{"top":"var:preset|spacing|100","bottom":"var:preset|spacing|100","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}}},"layout":{"type":"flex","orientation":"vertical"}} -->
<section class="wp-block-group spck-section-latest-posts" style="padding-top:var(--wp--preset--spacing--100);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--100);padding-left:var(--wp--preset--spacing--50)">
	<!-- wp:group {"templateLock":"all","lock":{"move":true,"remove":true},"className":"spck-section-latest-posts__top","layout":{"type":"flex","flexWrap":"nowrap"},"allowedBlocks":[]} -->
	<div class="wp-block-group spck-section-latest-posts__top">
		<!-- wp:heading -->
		<h2 class="wp-block-heading">À la une</h2>
		<!-- /wp:heading -->

		<!-- wp:navigation {"overlayMenu":"never","style":{"spacing":{"blockGap":"var:preset|spacing|30"}}} /-->
	</div>
	<!-- /wp:group -->

	<!-- wp:query {"className":"spck-section-latest-posts__loop","query":{"postType":"post","perPage":4,"pages":0,"offset":0,"order":"desc","orderBy":"date","sticky":"ignore","inherit":false},"namespace":"superstack/latest-posts"} -->
	<div class="wp-block-query spck-section-latest-posts__loop">
		<!-- wp:post-template -->
		<!-- wp:pattern {"slug":"superstack/card-post"} /-->
		<!-- /wp:post-template -->
	</div>
	<!-- /wp:query -->
</section>
<!-- /wp:group -->
