<?php

/**
 * Title: Section Prochains événements
 * Slug: superstack/section-upcoming-events
 * Categories: posts
 * Description: Afficher une section avec les prochains événements.
 * Inserter: false
 *
 * @package    Superstack
 * @subpackage Superstack/patterns
 * @since      1.0.0
 */

?>
<!-- wp:group {"tagName":"aside","metadata":{"name":"Section prochains événements"},"className":"spck-section-upcoming-events","style":{"spacing":{"padding":{"top":"var:preset|spacing|100","bottom":"var:preset|spacing|100","right":"var:preset|spacing|50","left":"var:preset|spacing|50"}}},"layout":{"type":"constrained"}} -->
<aside class="wp-block-group spck-section-upcoming-events" style="padding-top:var(--wp--preset--spacing--100);padding-bottom:var(--wp--preset--spacing--100);padding-right:var(--wp--preset--spacing--50);padding-left:var(--wp--preset--spacing--50)">
	<!-- wp:group {"align":"wide","style":{"spacing":{"blockGap":"var:preset|spacing|50"}},"layout":{"type":"flex","orientation":"vertical"}} -->
	<div class="wp-block-group alignwide">
		<!-- wp:group {"templateLock":"all","lock":{"move":true,"remove":true},"className":"spck-section-upcoming-events__top","layout":{"type":"flex","flexWrap":"nowrap"},"allowedBlocks":[]} -->
		<div class="wp-block-group spck-section-upcoming-events__top">
			<!-- wp:heading {"fontSize":"x-large"} -->
			<h2 class="wp-block-heading has-x-large-font-size">Prochains événements</h2>
			<!-- /wp:heading -->

			<!-- wp:navigation {"overlayMenu":"never","style":{"spacing":{"blockGap":"var:preset|spacing|30"}}} /-->
		</div>
		<!-- /wp:group -->

		<!-- wp:query {"className":"spck-section-upcoming-events__loop","query":{"postType":"event","perPage":3,"pages":0,"offset":0,"order":"desc","orderBy":"date","sticky":"ignore","inherit":false},"namespace":"superstack/upcoming-events"} -->
		<div class="wp-block-query spck-section-upcoming-events__loop">
			<!-- wp:post-template -->
			<!-- wp:pattern {"slug":"superstack/card-post"} /-->
			<!-- /wp:post-template -->

			<!-- wp:query-no-results -->
			<!-- wp:paragraph -->
			<p>Aucun événement à venir.</p>
			<!-- /wp:paragraph -->
			<!-- /wp:query-no-results -->
		</div>
		<!-- /wp:query -->
	</div>
	<!-- /wp:group -->
</aside>
<!-- /wp:group -->
