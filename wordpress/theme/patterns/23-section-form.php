<?php

/**
 * Title: Section Formulaire
 * Slug: superstack/section-form
 * Categories: contact
 * Description: Afficher une section avec un formulaire.
 *
 * @package    Superstack
 * @subpackage Superstack/patterns
 * @since      1.0.0
 */

?>
<!-- wp:group {"tagName":"section","metadata":{"name":"Section Formulaire","patternName":"superstack/section-form"},"className":"spck-section-form","style":{"spacing":{"padding":{"top":"var:preset|spacing|100","bottom":"var:preset|spacing|100","left":"var:preset|spacing|50","right":"var:preset|spacing|50"},"blockGap":"var:preset|spacing|50"}},"layout":{"type":"constrained"},"allowedBlocks":[]} -->
<section class="wp-block-group spck-section-form" style="padding-top:var(--wp--preset--spacing--100);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--100);padding-left:var(--wp--preset--spacing--50)">
	<!-- wp:group {"lock":{"move":true,"remove":true},"style":{"spacing":{"blockGap":"var:preset|spacing|30"}},"layout":{"type":"flex","orientation":"vertical"},"allowedBlocks":["core/paragraph","core/heading"]} -->
	<div class="wp-block-group">
		<!-- wp:heading -->
		<h2 class="wp-block-heading">Nous écrire</h2>
		<!-- /wp:heading -->

		<!-- wp:paragraph -->
		<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
		<!-- /wp:paragraph -->
	</div>
	<!-- /wp:group -->

	<!-- wp:forminator/forms {"lock":{"move":true,"remove":true}} /-->
</section>
<!-- /wp:group -->
