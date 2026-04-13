<?php

/**
 * Title: Carte de personne
 * Keywords: personne, équipe, contact, département, portrait
 * Slug: superstack/card-person
 * Categories: contact, about, media
 * Description: Afficher une carte de personne.
 * Post Types: page
 * Viewport width: 320
 *
 * @package    Superstack
 * @subpackage Superstack/patterns
 * @since      1.0.0
 */

?>

<!-- wp:group {"metadata":{"name":"Carte de personne"},"className":"spck-card-person","style":{"spacing":{"blockGap":"var:preset|spacing|20","padding":{"right":"var:preset|spacing|20","left":"var:preset|spacing|20","top":"var:preset|spacing|20","bottom":"var:preset|spacing|20"}}},"layout":{"type":"flex","flexWrap":"nowrap"},"lock":{"remove":true,"move":true},"allowedBlocks": []} -->
<div class="wp-block-group spck-card-person" style="padding-top:var(--wp--preset--spacing--20);padding-right:var(--wp--preset--spacing--20);padding-bottom:var(--wp--preset--spacing--20);padding-left:var(--wp--preset--spacing--20)">
	<!-- wp:group {"className":"spck-card-person__img","layout":{"type":"constrained"}, "lock":{"remove":false,"move":true}} -->
	<div class="wp-block-group spck-card-person__img">
		<!-- wp:image {"aspectRatio":"1","scale":"cover","className":"medium","lock":{"remove":true,"move":true}} -->
		<figure class="wp-block-image size-medium">
			<img src="" alt="" style="aspect-ratio:1;object-fit:cover" />
		</figure>
		<!-- /wp:image -->
	</div>
	<!-- /wp:group -->

	<!-- wp:group {"style":{"spacing":{"padding":{"right":"var:preset|spacing|20","left":"var:preset|spacing|20","top":"var:preset|spacing|20","bottom":"var:preset|spacing|20"},"blockGap":"var:preset|spacing|20"},"layout":{"selfStretch":"fill","flexSize":null}},"layout":{"type":"constrained"},"allowedBlocks":["core/heading","core/paragraph"],"lock":{"remove":true,"move":true}} -->
	<div class="wp-block-group" style="padding-top:var(--wp--preset--spacing--20);padding-right:var(--wp--preset--spacing--20);padding-bottom:var(--wp--preset--spacing--20);padding-left:var(--wp--preset--spacing--20)">
		<!-- wp:heading {"level":3,"lock":{"remove":true,"move":true}} -->
		<h3 class="wp-block-heading">Jane Doe</h3>
		<!-- /wp:heading -->
		<!-- wp:paragraph {"lock":{"move":true}} -->
		<p>Secrétariat</p>
		<!-- /wp:paragraph -->
	</div>
	<!-- /wp:group -->
</div>
<!-- /wp:group -->
