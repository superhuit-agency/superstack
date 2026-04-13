<?php

/**
 * Title: Section Articles liés
 * Slug: superstack/section-related-posts
 * Categories: posts
 * Description: Afficher une section avec les articles liés à l'article actuel.
 * Post Types: post
 * Keywords: related, posts, articles liés
 * Inserter: false
 *
 * @package    Superstack
 * @subpackage Superstack/patterns
 * @since      1.0.0
 */

?>
<!-- wp:group {"tagName":"aside","metadata":{"name":"Section articles liés"},"className":"spck-section-related-posts","style":{"spacing":{"padding":{"top":"var:preset|spacing|100","bottom":"var:preset|spacing|100","right":"var:preset|spacing|50","left":"var:preset|spacing|50"}}},"layout":{"type":"constrained"}} -->
<aside class="wp-block-group spck-section-related-posts" style="padding-top:var(--wp--preset--spacing--100);padding-bottom:var(--wp--preset--spacing--100);padding-right:var(--wp--preset--spacing--50);padding-left:var(--wp--preset--spacing--50)">
	<!-- wp:group {"align":"wide","style":{"spacing":{"blockGap":"var:preset|spacing|50"}},"layout":{"type":"flex","orientation":"vertical"}} -->
	<div class="wp-block-group alignwide">
		<!-- wp:group {"templateLock":"all","lock":{"move":true,"remove":true},"className":"spck-section-related-posts__top","layout":{"type":"flex","flexWrap":"nowrap"},"allowedBlocks":[]} -->
		<div class="wp-block-group spck-section-related-posts__top">
			<!-- wp:heading {"fontSize":"x-large"} -->
			<h2 class="wp-block-heading has-x-large-font-size">Articles liés</h2>
			<!-- /wp:heading -->

			<!-- wp:navigation {"overlayMenu":"never","style":{"spacing":{"blockGap":"var:preset|spacing|30"}}} /-->
		</div>
		<!-- /wp:group -->

		<!-- wp:query {"queryId":1,"namespace":"superstack/related-posts-by-category","namespace":"superstack/related-posts-by-category","className":"spck-section-related-posts__loop","query":{"postType":"post","perPage":3,"pages":0,"offset":0,"order":"desc","orderBy":"date","sticky":"ignore","inherit":false}} -->
		<div class="wp-block-query spck-section-related-posts__loop">
			<!-- wp:post-template -->
			<!-- wp:pattern {"slug":"superstack/card-post"} /-->
			<!-- /wp:post-template -->

			<!-- wp:query-no-results -->
			<!-- wp:paragraph -->
			<p>Aucun article lié trouvé.</p>
			<!-- /wp:paragraph -->
			<!-- /wp:query-no-results -->
		</div>
		<!-- /wp:query -->
	</div>
	<!-- /wp:group -->
</aside>
<!-- /wp:group -->
