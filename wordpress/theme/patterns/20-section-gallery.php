<?php

/**
 * Title: Section galerie
 * Slug: superstack/section-gallery
 * Categories: media
 * Description: Afficher une section avec une galerie d'images.
 *
 * @package    Superstack
 * @subpackage Superstack/patterns
 * @since      1.0.0
 */

?>
<!-- wp:group {"tagName":"section","metadata":{"name":"Section galerie","patternName":"superstack/section-gallery"},"className":"spck-section-gallery","style":{"spacing":{"padding":{"top":"var:preset|spacing|100","bottom":"var:preset|spacing|100","left":"var:preset|spacing|50","right":"var:preset|spacing|50"},"blockGap":"var:preset|spacing|50"}},"layout":{"type":"constrained"}} -->
<section class="wp-block-group spck-section-gallery" style="padding-top:var(--wp--preset--spacing--100);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--100);padding-left:var(--wp--preset--spacing--50)">
	<!-- wp:group {"lock":{"move":true,"remove":true},"className":"is-style-default","style":{"spacing":{"blockGap":"var:preset|spacing|40"}},"layout":{"type":"flex","orientation":"vertical"},"allowedBlocks":["core/paragraph","core/heading"]} -->
	<div class="wp-block-group is-style-default">
		<!-- wp:heading -->
		<h2 class="wp-block-heading">Évènements qui ont eu lieu en Suisse romande</h2>
		<!-- /wp:heading -->

		<!-- wp:paragraph -->
		<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
		<!-- /wp:paragraph -->
	</div>
	<!-- /wp:group -->

	<!-- wp:gallery {"lock":{"move":true,"remove":true},"imageCrop":false,"linkTo":"media"} -->
	<figure class="wp-block-gallery has-nested-images columns-default">
		<!-- wp:image {"url":"https://images.pexels.com/photos/8526723/pexels-photo-8526723.jpeg","sizeSlug":"large","linkDestination":"none"} -->
		<figure class="wp-block-image size-large"><img src="https://images.pexels.com/photos/8526723/pexels-photo-8526723.jpeg" alt="" /></figure>
		<!-- /wp:image -->

		<!-- wp:image {"url":"https://images.pexels.com/photos/5699458/pexels-photo-5699458.jpeg","sizeSlug":"large","linkDestination":"none"} -->
		<figure class="wp-block-image size-large"><img src="https://images.pexels.com/photos/5699458/pexels-photo-5699458.jpeg" alt="" /></figure>
		<!-- /wp:image -->

		<!-- wp:image {"url":"https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg","sizeSlug":"large","linkDestination":"none"} -->
		<figure class="wp-block-image size-large"><img src="https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg" alt="" /></figure>
		<!-- /wp:image -->

		<!-- wp:image {"url":"https://images.pexels.com/photos/7579188/pexels-photo-7579188.jpeg","sizeSlug":"large","linkDestination":"none"} -->
		<figure class="wp-block-image size-large"><img src="https://images.pexels.com/photos/7579188/pexels-photo-7579188.jpeg" alt="" /></figure>
		<!-- /wp:image -->
	</figure>

	<!-- wp:image {"url":"https://images.pexels.com/photos/6985732/pexels-photo-6985732.jpeg","sizeSlug":"large","linkDestination":"none"} -->
	<figure class="wp-block-image size-large"><img src="https://images.pexels.com/photos/6985732/pexels-photo-6985732.jpeg" alt="" /></figure>
	<!-- /wp:image -->
	<!-- /wp:gallery -->
</section>
<!-- /wp:group -->
