<?php

/**
 * Title: En-tête avec image
 * Slug: superstack/hero-text-media
 * Categories: header
 * Description: Afficher un en-tête avec du texte et une image.
 *
 * @package    Superstack
 * @subpackage Superstack/patterns
 * @since      1.0.0
 */

?>
<!-- wp:group {"tagName":"header","templateLock":false,"lock":{"move":false,"remove":false},"metadata":{"name":"En-tête avec image","patternName":"core/block/26"},"className":"spck-header-text-media","style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}}},"layout":{"type":"constrained"},"allowedBlocks":[]} -->
<header class="wp-block-group spck-header-text-media" style="padding-top:var(--wp--preset--spacing--50);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50);padding-left:var(--wp--preset--spacing--50)">
	<!-- wp:columns {"verticalAlignment":"center","templateLock":"all","lock":{"move":true,"remove":true},"style":{"spacing":{"blockGap":{"left":"var:preset|spacing|50"}}}} -->
	<div class="wp-block-columns are-vertically-aligned-center">
		<!-- wp:column {"verticalAlignment":"center","width":"50%","allowedBlocks":[]} -->
		<div class="wp-block-column is-vertically-aligned-center" style="flex-basis:50%">
			<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|50"}},"layout":{"type":"flex","orientation":"vertical"},"allowedBlocks":["core/buttons"]} -->
			<div class="wp-block-group">
				<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|30"}},"layout":{"type":"constrained"},"allowedBlocks":[]} -->
				<div class="wp-block-group">
					<!-- wp:post-title {"level":1} /-->

					<!-- wp:paragraph {"fontSize":"large"} -->
					<p class="has-large-font-size">Nous fédèrons aujourd’hui 31&nbsp;organisations d’aide et d’entraide, actives en Suisse romande dans l’accueil, l’accompagnement et le développement de projets communautaires avec et pour les personnes souffrant de troubles psychiques et les proches.</p>
					<!-- /wp:paragraph -->
				</div>
				<!-- /wp:group -->

				<!-- wp:buttons {"lock":{"move":true,"remove":false}} -->
				<div class="wp-block-buttons">
					<!-- wp:button -->
					<div class="wp-block-button"><a class="wp-block-button__link wp-element-button">À propos de Superstack</a></div>
					<!-- /wp:button -->
				</div>
				<!-- /wp:buttons -->
			</div>
			<!-- /wp:group -->
		</div>
		<!-- /wp:column -->

		<!-- wp:column {"verticalAlignment":"center","width":"50%"} -->
		<div class="wp-block-column is-vertically-aligned-center" style="flex-basis:50%">
			<!-- wp:image {"url":"<?php echo esc_url(get_theme_file_uri('assets/hero-text-media-new.svg')); ?>","aspectRatio":"1","scale":"contain","sizeSlug":"full","linkDestination":"none","style":{"layout":{"selfStretch":"fit","flexSize":null}}} -->
			<figure class="wp-block-image size-full">
				<img src="<?php echo esc_url(get_theme_file_uri('assets/hero-text-media-new.svg')); ?>" alt="Superstack" style="aspect-ratio:1;object-fit:contain" />
			</figure>
			<!-- /wp:image -->
		</div>
		<!-- /wp:column -->
	</div>
	<!-- /wp:columns -->
</header>
<!-- /wp:group -->
