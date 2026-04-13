<?php

/**
 * Title: Section texte
 * Slug: superstack/section-text
 * Categories: text
 * Description: Afficher une section avec du texte.
 *
 * @package    Superstack
 * @subpackage Superstack/patterns
 * @since      1.0.0
 */

?>
<!-- wp:group {"tagName":"section","metadata":{"name":"Section texte","categories":["content"],"patternName":"superstack/section-text"},"className":"spck-section-text","style":{"spacing":{"padding":{"top":"var:preset|spacing|100","bottom":"var:preset|spacing|100","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}}},"layout":{"type":"constrained"},"allowedBlocks":[]} -->
<section class="wp-block-group spck-section-text" style="padding-top:var(--wp--preset--spacing--100);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--100);padding-left:var(--wp--preset--spacing--50)">
	<!-- wp:columns {"lock":{"move":true,"remove":true},"style":{"spacing":{"blockGap":{"left":"var:preset|spacing|70"}}}} -->
	<div class="wp-block-columns">
		<!-- wp:column {"lock":{"move":false,"remove":true},"allowedBlocks":[]} -->
		<div class="wp-block-column">
			<!-- wp:heading {"textAlign":"left","lock":{"move":true,"remove":true},"style":{"layout":{"selfStretch":"fixed","flexSize":"50%"}}} -->
			<h2 class="wp-block-heading has-text-align-left">Vision et charte</h2>
			<!-- /wp:heading -->
		</div>
		<!-- /wp:column -->

		<!-- wp:column {"lock":{"move":false,"remove":true},"allowedBlocks":[]} -->
		<div class="wp-block-column">
			<!-- wp:group {"lock":{"move":true,"remove":true},"style":{"layout":{"selfStretch":"fixed","flexSize":"50%"},"spacing":{"blockGap":"var:preset|spacing|40"}},"layout":{"type":"flex","orientation":"vertical"},"allowedBlocks":[]} -->
			<div class="wp-block-group">
				<!-- wp:group {"lock":{"move":true,"remove":true},"layout":{"type":"constrained"},"allowedBlocks":["core/paragraph","core/heading","core/list","core/quote","core/code","core/details","core/math","core/preformatted","core/pullquote","core/table","core/verse","core/freeform"]} -->
				<div class="wp-block-group">
					<!-- wp:paragraph  -->
					<p>Dans tous les cantons francophones, les organisations membres œuvrent à la construction d'une société, qui replace la personne humaine dans sa dignité et donne sens à sa dimension communautaire et spirituelle. Leurs valeurs communes sont définies dans une charte éthique qui se réfère à la Déclaration universelle des droits de l'homme et, plus particulièrement, à la Convention onusienne des droits des personnes en situation de handicap.</p>
					<!-- /wp:paragraph -->

					<!-- wp:paragraph  -->
					<p>La charte SUPERSTACK se rattache également à la vision de l'OMS (Organisation mondiale de la santé) qui stipule que « la santé mentale est un état de bien-être qui permet à chacun de réaliser son potentiel, de faire face aux difficultés normales de la vie, de travailler avec succès et de manière productive et d'être en mesure d'apporter une contribution à la communauté ».</p>
					<!-- /wp:paragraph -->

					<!-- wp:paragraph  -->
					<p>Pour que les talents des personnes soient reconnus et pour qu'elles puissent accéder à des rôles sociaux valorisant et valorisés, la SUPERSTACK invite toutes les structures économiques, culturelles et sociales, à réfléchir avec elle, à la manière de concrétiser :</p>
					<!-- /wp:paragraph -->

					<!-- wp:list  -->
					<ul class="wp-block-list">
						<!-- wp:list-item -->
						<li>un partage équitable des ressources et la quête d'un juste équilibre entre des intérêts économiques, commerciaux et sociaux ;</li>
						<!-- /wp:list-item -->

						<!-- wp:list-item -->
						<li>l'attention et le soin à donner à la qualité des liens que les individus tissent ensemble ;</li>
						<!-- /wp:list-item -->

						<!-- wp:list-item -->
						<li>les apports de chacun à la réalisation de projets utiles à la vie de sa région et de son pays.</li>
						<!-- /wp:list-item -->
					</ul>
					<!-- /wp:list -->
				</div>
				<!-- /wp:group -->

				<!-- wp:buttons {"lock":{"move":true,"remove":false}} -->
				<div class="wp-block-buttons">
					<!-- wp:button {"className":"is-style-outline"} -->
					<div class="wp-block-button is-style-outline">
						<a class="wp-block-button__link wp-element-button" href="#">Lire notre charte</a>
					</div>
					<!-- /wp:button -->
				</div>
				<!-- /wp:buttons -->
			</div>
			<!-- /wp:group -->
		</div>
		<!-- /wp:column -->
	</div>
	<!-- /wp:columns -->
</section>
<!-- /wp:group -->
