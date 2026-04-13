<?php

/**
 * Title: En-tête texte
 * Slug: superstack/hero-text
 * Categories: header
 * Description: Afficher un en-tête avec du texte.
 *
 * @package    Superstack
 * @subpackage Superstack/patterns
 * @since      1.0.0
 */

?>
<!-- wp:group {"tagName":"header","lock":{"move":false,"remove":false},"metadata":{"name":"En-tête texte","categories":["header"],"patternName":"superstack/hero-text"},"align":"full","className":"spck-hero-text","layout":{"type":"constrained"},"allowedBlocks":[]} -->
<header class="wp-block-group alignfull spck-hero-text">
	<!-- wp:group {"lock":{"move":true,"remove":true},"className":"spck-hero-text__inner","style":{"spacing":{"margin":{"top":"0","bottom":"0"},"padding":{"top":"var:preset|spacing|100","bottom":"var:preset|spacing|100","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}}},"layout":{"type":"constrained"},"allowedBlocks":[]} -->
	<div class="wp-block-group spck-hero-text__inner" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--100);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--100);padding-left:var(--wp--preset--spacing--50)">
		<!-- wp:group {"lock":{"move":true,"remove":true},"className":"spck-hero-text__stack","style":{"spacing":{"blockGap":"var:preset|spacing|30"}},"layout":{"type":"flex","orientation":"vertical"},"allowedBlocks":["core/paragraph","core/heading"]} -->
		<div class="wp-block-group spck-hero-text__stack">
			<!-- wp:post-title {"level":1} /-->

			<!-- wp:paragraph {"lock":{"move":true,"remove":false},"fontSize":"large"} -->
			<p class="has-large-font-size">Nous sommes la plateforme romande de l'action citoyenne dans le domaine de la santé mentale. La Superstack est reconnue comme organisme faîtier par l'OFAS (Office fédéral des assurances sociales). Elle rassemble actuellement plus d'une trentaine d'organisations d'aide et d'entraide.</p>
			<!-- /wp:paragraph -->
		</div>
		<!-- /wp:group -->
	</div>
	<!-- /wp:group -->
</header>
<!-- /wp:group -->
