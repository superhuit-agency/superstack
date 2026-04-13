<?php

/**
 * Title: Section texte mis en valeur
 * Slug: superstack/section-text-highlight
 * Categories: text,featured
 * Description: Afficher une section avec du texte mis en valeur.
 *
 * @package    Superstack
 * @subpackage Superstack/patterns
 * @since      1.0.0
 */

?>
<!-- wp:group {"tagName":"section","metadata":{"name":"Section texte mis en valeur","categories":["content"],"patternName":"superstack/section-text-highlight"},"align":"full","className":"spck-section-text-highlight","style":{"spacing":{"padding":{"top":"var:preset|spacing|100","bottom":"var:preset|spacing|100","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}}},"layout":{"type":"constrained"},"allowedBlocks":[]} -->
<section class="wp-block-group alignfull spck-section-text-highlight" style="padding-top:var(--wp--preset--spacing--100);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--100);padding-left:var(--wp--preset--spacing--40)">
	<!-- wp:group {"lock":{"move":true,"remove":true},"className":"spck-section-text-highlight__inner","style":{"spacing":{"blockGap":"var:preset|spacing|30"}},"layout":{"type":"flex","orientation":"vertical"},"allowedBlocks":[]} -->
	<div class="wp-block-group spck-section-text-highlight__inner">
		<!-- wp:heading {"lock":{"move":true,"remove":true}} -->
		<h2 class="wp-block-heading">Notre mission</h2>
		<!-- /wp:heading -->

		<!-- wp:group {"lock":{"move":true,"remove":true},"layout":{"type":"constrained"},"allowedBlocks":["core/paragraph"]} -->
		<div class="wp-block-group">
			<!-- wp:paragraph {"align":"left","fontSize":"x-large"} -->
			<p class="has-text-align-left has-x-large-font-size">Nous contribuons à faire évoluer les structures collectives, afin de prévenir, maintenir et rétablir la santé psychique au sein de la population suisse.</p>
			<!-- /wp:paragraph -->

			<!-- wp:paragraph {"fontSize":"x-large"} -->
			<p class="has-x-large-font-size">Pour réduire la montée de l'individualisme et redonner sa juste place à des compétences et à des postures citoyennes et de responsabilité sociale, nous créons, organisons et soutenons des projets qui favorisent la participation et l'intégration des patients psychiques.</p>
			<!-- /wp:paragraph -->
		</div>
		<!-- /wp:group -->
	</div>
	<!-- /wp:group -->
</section>
<!-- /wp:group -->
