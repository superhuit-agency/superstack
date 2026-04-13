<?php

/**
 * Title: Section Équipe
 * * Keywords: personne, contact, département, portrait
 * Slug: superstack/section-people
 * Categories: media
 * Description: Afficher une section avec des membres de l'équipe.
 *
 * @package    Superstack
 * @subpackage Superstack/patterns
 * @since      1.0.0
 */

?>
<!-- wp:group {"tagName":"section","metadata":{"name":"Section Équipe","categories":["media"],"patternName":"superstack/section-people"},"className":"spck-section-people","style":{"spacing":{"padding":{"right":"var:preset|spacing|50","left":"var:preset|spacing|50","top":"var:preset|spacing|100","bottom":"var:preset|spacing|100"},"blockGap":"var:preset|spacing|50"}},"layout":{"type":"constrained"},"allowedBlocks":[]} -->
<section class="wp-block-group spck-section-people" style="padding-top:var(--wp--preset--spacing--100);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--100);padding-left:var(--wp--preset--spacing--50)">
	<!-- wp:group {"lock":{"move":true,"remove":true},"style":{"spacing":{"blockGap":"var:preset|spacing|30"}},"layout":{"type":"constrained"},"allowedBlocks":["core/paragraph","core/heading"]} -->
	<div class="wp-block-group">
		<!-- wp:heading {"textAlign":"left","lock":{"move":true,"remove":true}} -->
		<h2 class="wp-block-heading has-text-align-left">Équipe professionnelle</h2>
		<!-- /wp:heading -->

		<!-- wp:paragraph -->
		<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
		<!-- /wp:paragraph -->
	</div>
	<!-- /wp:group -->

	<!-- wp:group {"lock":{"move":true,"remove":true},"style":{"spacing":{"blockGap":"var:preset|spacing|20"}},"layout":{"type":"grid"},"allowedBlocks":["core/group"]} -->
	<div class="wp-block-group">
		<!-- wp:pattern {"slug":"superstack/card-person"} /-->
		<!-- wp:pattern {"slug":"superstack/card-person"} /-->
		<!-- wp:pattern {"slug":"superstack/card-person"} /-->
		<!-- wp:pattern {"slug":"superstack/card-person"} /-->
		<!-- wp:pattern {"slug":"superstack/card-person"} /-->
	</div>
	<!-- /wp:group -->
</section>
<!-- /wp:group -->
