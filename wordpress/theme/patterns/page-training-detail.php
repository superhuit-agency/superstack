<?php

/**
 * Title: Template de détail d'une formation
 * Slug: superstack/page-training-detail
 * Categories: featured
 * Block Types: core/post-content
 * Post Types: page, wp_template
 * Viewport width: 1440
 * Description: Un template de détail d'une formation.
 *
 * @package Superstack
 * @subpackage Superstack/patterns
 * @since 1.0.0
 */

?>

<!-- wp:pattern {"slug":"superstack/hero-text"} /-->

<!-- wp:group {"tagName":"section","metadata":{"name":"Section texte sur 2 colonnes","categories":["text"],"patternName":"superstack/section-text-2col"},"className":"spck-section-text-2col","style":{"spacing":{"padding":{"top":"var:preset|spacing|100","bottom":"var:preset|spacing|80","right":"var:preset|spacing|50","left":"var:preset|spacing|50"}}},"layout":{"type":"constrained"},"allowedBlocks":[]} -->
<section class="wp-block-group spck-section-text-2col" style="padding-top:var(--wp--preset--spacing--100);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--80);padding-left:var(--wp--preset--spacing--50)">
	<!-- wp:group {"lock":{"move":true,"remove":true},"style":{"spacing":{"blockGap":"var:preset|spacing|50"}},"layout":{"type":"flex","orientation":"vertical"},"allowedBlocks":["core/columns"]} -->
	<div class="wp-block-group">
		<!-- wp:columns {"lock":{"move":false,"remove":true}} -->
		<div class="wp-block-columns">
			<!-- wp:column {"width":"100%","lock":{"move":false,"remove":true},"allowedBlocks":[]} -->
			<div class="wp-block-column" style="flex-basis:100%">
				<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|30"}},"layout":{"type":"flex","orientation":"vertical"},"allowedBlocks":["core/paragraph","core/heading","core/list","core/quote","core/code","core/details","core/math","core/preformatted","core/pullquote","core/table","core/verse","core/freeform","core/accordion","core/buttons"]} -->
				<div class="wp-block-group">
					<!-- wp:heading {"level":3} -->
					<h3 class="wp-block-heading">Objectifs</h3>
					<!-- /wp:heading -->

					<!-- wp:list -->
					<ul class="wp-block-list">
						<!-- wp:list-item -->
						<li>Dégager les éléments-clés en jeu dans l’écoute active des autres</li>
						<!-- /wp:list-item -->

						<!-- wp:list-item -->
						<li>Se confronter à sa manière d’écouter et en faire l’analyse</li>
						<!-- /wp:list-item -->
					</ul>
					<!-- /wp:list -->
				</div>
				<!-- /wp:group -->
			</div>
			<!-- /wp:column -->

			<!-- wp:column {"width":"100%","lock":{"move":false,"remove":true}} -->
			<div class="wp-block-column" style="flex-basis:100%">
				<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|30"}},"layout":{"type":"flex","orientation":"vertical"},"allowedBlocks":["core/paragraph","core/heading","core/list","core/quote","core/code","core/details","core/math","core/preformatted","core/pullquote","core/table","core/verse","core/freeform","core/accordion","core/buttons"]} -->
				<div class="wp-block-group">
					<!-- wp:heading {"level":3} -->
					<h3 class="wp-block-heading">Intervenante</h3>
					<!-- /wp:heading -->

					<!-- wp:list {"className":"is-style-default"} -->
					<ul class="wp-block-list is-style-default">
						<!-- wp:list-item {"fontSize":"medium"} -->
						<li class="has-medium-font-size">MÉLINA BLANC <br>Responsable de formation à La Main Tendue Vaud</li>
						<!-- /wp:list-item -->
					</ul>
					<!-- /wp:list -->
				</div>
				<!-- /wp:group -->
			</div>
			<!-- /wp:column -->
		</div>
		<!-- /wp:columns -->

		<!-- wp:columns -->
		<div class="wp-block-columns">
			<!-- wp:column {"width":"100%"} -->
			<div class="wp-block-column" style="flex-basis:100%">
				<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|30"}},"layout":{"type":"flex","orientation":"vertical"},"allowedBlocks":["core/paragraph","core/heading","core/list","core/quote","core/code","core/details","core/math","core/preformatted","core/pullquote","core/table","core/verse","core/freeform","core/accordion","core/buttons"]} -->
				<div class="wp-block-group">
					<!-- wp:heading {"level":3} -->
					<h3 class="wp-block-heading">Informations pratiques</h3>
					<!-- /wp:heading -->

					<!-- wp:list {"className":"is-style-default"} -->
					<ul class="wp-block-list is-style-default">
						<!-- wp:list-item -->
						<li><strong>Dates</strong><br>Les jeudis 27 novembre, le 4 décembre, le 11 décembre de 13h30 à 17h</li>
						<!-- /wp:list-item -->

						<!-- wp:list-item -->
						<li><strong>Lieu</strong><br>Superstack (2ème étage)<br />avenue de la gare 52, 1003 Lausanne</li>
						<!-- /wp:list-item -->
					</ul>
					<!-- /wp:list -->
				</div>
				<!-- /wp:group -->
			</div>
			<!-- /wp:column -->

			<!-- wp:column {"width":"100%"} -->
			<div class="wp-block-column" style="flex-basis:100%">
				<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|30"}},"layout":{"type":"flex","orientation":"vertical"},"allowedBlocks":["core/paragraph","core/heading","core/list","core/quote","core/code","core/details","core/math","core/preformatted","core/pullquote","core/table","core/verse","core/freeform","core/accordion","core/buttons"]} -->
				<div class="wp-block-group">
					<!-- wp:heading {"level":3} -->
					<h3 class="wp-block-heading">Tarifs</h3>
					<!-- /wp:heading -->

					<!-- wp:list {"className":"is-style-default"} -->
					<ul class="wp-block-list is-style-default">
						<!-- wp:list-item -->
						<li>Membre de la Superstack : 50 CHF</li>
						<!-- /wp:list-item -->

						<!-- wp:list-item -->
						<li>Non-membre de la Superstack : 80 CHF</li>
						<!-- /wp:list-item -->
					</ul>
					<!-- /wp:list -->
				</div>
				<!-- /wp:group -->
			</div>
			<!-- /wp:column -->
		</div>
		<!-- /wp:columns -->
	</div>
	<!-- /wp:group -->
</section>
<!-- /wp:group -->

<!-- wp:group {"tagName":"section","metadata":{"categories":["call-to-action"],"patternName":"superstack/section-cta","name":"Section Appel à l'action"},"align":"full","className":"spck-cta","style":{"spacing":{"padding":{"top":"var:preset|spacing|100","bottom":"var:preset|spacing|100"},"blockGap":"0"}},"layout":{"type":"constrained"},"allowedBlocks":[]} -->
<section class="wp-block-group alignfull spck-cta" style="padding-top:var(--wp--preset--spacing--100);padding-bottom:var(--wp--preset--spacing--100)">
	<!-- wp:group {"templateLock":"all","lock":{"move":true,"remove":true},"className":"spck-cta__inner","style":{"spacing":{"blockGap":"var:preset|spacing|40"}},"layout":{"type":"flex","orientation":"vertical"},"allowedBlocks":[]} -->
	<div class="wp-block-group spck-cta__inner">
		<!-- wp:heading {"textAlign":"center","lock":{"move":true,"remove":true}} -->
		<h2 class="wp-block-heading has-text-align-center">Passez de l'écoute à l'écoute active</h2>
		<!-- /wp:heading -->

		<!-- wp:paragraph {"align":"center","lock":{"move":true,"remove":true},"fontSize":"x-large"} -->
		<p class="has-text-align-center has-x-large-font-size">Trois après-midis pour affiner votre posture, gagner en impact et repartir avec des outils concrets à mettre en pratique dès le lendemain</p>
		<!-- /wp:paragraph -->

		<!-- wp:buttons {"lock":{"move":true,"remove":true},"style":{"spacing":{"margin":{"top":"0"}}}} -->
		<div class="wp-block-buttons" style="margin-top:0">
			<!-- wp:button {"textAlign":"center","className":"is-style-outline"} -->
			<div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-text-align-center wp-element-button" href="/cours/inscription/">S'inscrire</a></div>
			<!-- /wp:button -->
		</div>
		<!-- /wp:buttons -->
	</div>
	<!-- /wp:group -->
</section>
<!-- /wp:group -->
