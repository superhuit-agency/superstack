<?php

/**
 * Title: Carte de membre
 * Slug: superstack/card-member
 * Categories: posts
 * Description: Afficher une carte de membre.
 * Viewport width: 320
 * Inserter: false
 *
 * @package    Superstack
 * @subpackage Superstack/patterns
 * @since      1.0.0
 */

?>
<!-- wp:group {"className":"spck-card-member","style":{"spacing":{"blockGap":"var:preset|spacing|20","padding":{"right":"var:preset|spacing|20","left":"var:preset|spacing|20","top":"var:preset|spacing|20","bottom":"var:preset|spacing|20"}}},"layout":{"type":"flex","flexWrap":"nowrap"}} -->
<div class="wp-block-group spck-card-member" style="padding-top:var(--wp--preset--spacing--20);padding-right:var(--wp--preset--spacing--20);padding-bottom:var(--wp--preset--spacing--20);padding-left:var(--wp--preset--spacing--20)">
	<!-- wp:post-featured-image {"aspectRatio":"1","width":"150px","scale":"contain","sizeSlug":"medium"} /-->
	<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|20","padding":{"top":"var:preset|spacing|20","bottom":"var:preset|spacing|20","left":"var:preset|spacing|20","right":"var:preset|spacing|20"}}}} -->
	<div class="wp-block-group" style="padding-top:var(--wp--preset--spacing--20);padding-right:var(--wp--preset--spacing--20);padding-bottom:var(--wp--preset--spacing--20);padding-left:var(--wp--preset--spacing--20)">
		<!-- wp:post-title /-->
		<!-- wp:post-content /-->
		<!-- wp:read-more {"content":"Site Internet","linkTarget":"_blank"} /-->
	</div>
	<!-- /wp:group -->
</div>
<!-- /wp:group -->
