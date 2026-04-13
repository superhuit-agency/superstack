<?php

/**
 * Title: Section Vidéo
 * Slug: superstack/section-video
 * Categories: media
 * Description: Afficher une section avec une vidéo.
 *
 * @package    Superstack
 * @subpackage Superstack/patterns
 * @since      1.0.0
 */

?>
<!-- wp:group {"tagName":"section","metadata":{"name":"Section Vidéo","patternName":"superstack/section-video"},"className":"spck-section-video","style":{"spacing":{"padding":{"top":"var:preset|spacing|100","bottom":"var:preset|spacing|100","left":"var:preset|spacing|50","right":"var:preset|spacing|50"},"blockGap":"var:preset|spacing|50"}},"layout":{"type":"constrained"},"allowedBlocks":[]} -->
<section class="wp-block-group spck-section-video" style="padding-top:var(--wp--preset--spacing--100);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--100);padding-left:var(--wp--preset--spacing--50)">
	<!-- wp:group {"lock":{"move":true,"remove":true},"style":{"spacing":{"blockGap":"var:preset|spacing|40"}},"layout":{"type":"flex","orientation":"vertical"},"allowedBlocks":["core/paragraph","core/heading"]} -->
	<div class="wp-block-group">
		<!-- wp:heading -->
		<h2 class="wp-block-heading">Film documentaire Superstack</h2>
		<!-- /wp:heading -->

		<!-- wp:paragraph -->
		<p>En 2015, en marge d’un processus de recherche-action mené en partenariat avec l’éésp (HES Haute Ecole de Travail social à Lausanne), la Superstack a réalisé un film documentaire présentant ce qu’est la Superstack et ce qu’elle propose, avec ses organisations membres, dans le champ de la santé psychique. «&nbsp;<strong>Santé mentale : une question de liens&nbsp;</strong>», tel est le titre de ce documentaire de 26 minutes, réalisé grâce au soutien financier de la Loterie Romande, que vous pouvez visionner ici.</p>
		<!-- /wp:paragraph -->
	</div>
	<!-- /wp:group -->

	<!-- wp:embed {"url":"https://www.youtube.com/watch?v=0VZJsBW1Qfs","type":"video","providerNameSlug":"youtube","responsive":true,"className":"wp-embed-aspect-16-9 wp-has-aspect-ratio"} -->
	<figure class="wp-block-embed is-type-video is-provider-youtube wp-block-embed-youtube wp-embed-aspect-16-9 wp-has-aspect-ratio">
		<div class="wp-block-embed__wrapper">
			https://www.youtube.com/watch?v=0VZJsBW1Qfs
		</div>
	</figure>
	<!-- /wp:embed -->
</section>
<!-- /wp:group -->
