<?php

/**
 * Title: Section texte avec un média
 * Slug: superstack/section-text-media
 * Categories: text,media,video
 * Description: Afficher une section avec du texte et un média (Image ou vidéo).
 *
 * @package    Superstack
 * @subpackage Superstack/patterns
 * @since      1.0.0
 */
?>
<!-- wp:group {"tagName":"section","metadata":{"name":"Section texte avec un média","categories":["content"],"patternName":"superstack/section-text-media"},"className":"spck-text-media","style":{"spacing":{"padding":{"top":"var:preset|spacing|100","bottom":"var:preset|spacing|100","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}}},"layout":{"type":"constrained"}} -->
<section class="wp-block-group spck-text-media" style="padding-top:var(--wp--preset--spacing--100);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--100);padding-left:var(--wp--preset--spacing--50)">
	<!-- wp:columns {"lock":{"move":true,"remove":true},"style":{"spacing":{"blockGap":{"left":"166px"}}}} -->
	<div class="wp-block-columns">
		<!-- wp:column {"verticalAlignment":"center","width":"100%","lock":{"move":false,"remove":true},"allowedBlocks":[]} -->
		<div class="wp-block-column is-vertically-aligned-center" style="flex-basis:100%">
			<!-- wp:group {"lock":{"move":true,"remove":true},"style":{"spacing":{"blockGap":"var:preset|spacing|30"}},"layout":{"type":"flex","orientation":"vertical"},"allowedBlocks":["core/buttons"]} -->
			<div class="wp-block-group">
				<!-- wp:heading {"lock":{"move":true,"remove":true},"style":{"layout":{"selfStretch":"fit","flexSize":null}}} -->
				<h2 class="wp-block-heading">Ressources humaines</h2>
				<!-- /wp:heading -->

				<!-- wp:group {"lock":{"move":true,"remove":true},"layout":{"type":"constrained"},"allowedBlocks":["core/paragraph","core/heading","core/list","core/quote","core/code","core/details","core/math","core/preformatted","core/pullquote","core/table","core/verse","core/freeform"]} -->
				<div class="wp-block-group">
					<!-- wp:paragraph -->
					<p>Les projets sont conçus et mis en œuvre grâce aux expertises spécifiques et complémentaires :</p>
					<!-- /wp:paragraph -->

					<!-- wp:list -->
					<ul class="wp-block-list">
						<!-- wp:list-item -->
						<li>de patients psychiques en rétablissement et qui ont choisi d'investir leurs compétences dans des responsabilités associatives;</li>
						<!-- /wp:list-item -->

						<!-- wp:list-item -->
						<li>de proches de personnes souffrant de maladies psychiques et qui mettent cette expérience au service d'un engagement citoyen ;</li>
						<!-- /wp:list-item -->

						<!-- wp:list-item -->
						<li>de professionnels de l'accompagnement psychosocial motivés par des interventions sur les structures sociétales et par des relations de partenariat avec les familles et l'ensemble des acteurs sociaux.</li>
						<!-- /wp:list-item -->
					</ul>
					<!-- /wp:list -->
				</div>
				<!-- /wp:group -->
			</div>
			<!-- /wp:group -->
		</div>
		<!-- /wp:column -->

		<!-- wp:column {"verticalAlignment":"center","width":"100%","lock":{"move":false,"remove":true},"allowedBlocks":["core/image","core/video","core/audio"]} -->
		<div class="wp-block-column is-vertically-aligned-center" style="flex-basis:100%">
			<!-- wp:image {"url":"<?php echo esc_url(get_theme_file_uri('assets/section-text-media-team-work.svg')); ?>","sizeSlug":"full","linkDestination":"none","align":"center"} -->
			<figure class="wp-block-image aligncenter size-full"><img src="<?php echo esc_url(get_theme_file_uri('assets/section-text-media-team-work.svg')); ?>" alt="Superstack - Équipe" /></figure>
			<!-- /wp:image -->
		</div>
		<!-- /wp:column -->
	</div>
	<!-- /wp:columns -->
</section>
<!-- /wp:group -->
