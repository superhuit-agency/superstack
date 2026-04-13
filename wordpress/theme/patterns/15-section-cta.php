<?php

/**
 * Title: Section Appel à l'action
 * Slug: superstack/section-cta
 * Categories: text,featured,call-to-action
 * Description: Afficher une section avec un bouton d'appel à l'action.
 *
 * @package    Superstack
 * @subpackage Superstack/patterns
 * @since      1.0.0
 */

?>
<!-- wp:group {"tagName":"section","metadata":{"categories":["content"],"patternName":"superstack/section-cta","name":"Section Appel à l'action"},"align":"full","className":"spck-cta","style":{"spacing":{"padding":{"top":"var:preset|spacing|100","bottom":"var:preset|spacing|100"},"blockGap":"0"}},"layout":{"type":"constrained"},"allowedBlocks":[]} -->
<section class="wp-block-group alignfull spck-cta" style="padding-top:var(--wp--preset--spacing--100);padding-bottom:var(--wp--preset--spacing--100)">
	<!-- wp:group {"templateLock":"all","lock":{"move":true,"remove":true},"className":"spck-cta__inner","style":{"spacing":{"blockGap":"var:preset|spacing|40"}},"layout":{"type":"flex","orientation":"vertical"},"allowedBlocks":[]} -->
	<div class="wp-block-group spck-cta__inner">
		<!-- wp:heading {"textAlign":"center","lock":{"move":true,"remove":true}} -->
		<h2 class="wp-block-heading has-text-align-center">Ressources</h2>
		<!-- /wp:heading -->

		<!-- wp:paragraph {"align":"center","lock":{"move":true,"remove":true},"fontSize":"x-large"} -->
		<p class="has-text-align-center has-x-large-font-size">La Superstack met à votre disposition des ressources documentaires, audios et vidéos pour mieux comprendre et appréhender la pair-aidance</p>
		<!-- /wp:paragraph -->

		<!-- wp:buttons {"lock":{"move":true,"remove":true},"style":{"spacing":{"margin":{"top":"0"}}}} -->
		<div class="wp-block-buttons" style="margin-top:0">
			<!-- wp:button {"textAlign":"center","className":"is-style-outline"} -->
			<div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-text-align-center wp-element-button">Accéder aux ressources</a></div>
			<!-- /wp:button -->
		</div>
		<!-- /wp:buttons -->
	</div>
	<!-- /wp:group -->
</section>
<!-- /wp:group -->
