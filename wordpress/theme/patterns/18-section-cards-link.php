<?php

/**
 * Title: Section Cartes avec Lien
 * Slug: superstack/section-cards-link
 * Keywords: documents, fichiers, pdf, télécharger
 * Categories: text,call-to-action
 * Description: Afficher une section avec des cartes avec un lien.
 * Post Types: page
 *
 * @package    Superstack
 * @subpackage Superstack/patterns
 * @since      1.0.0
 */

?>
<!-- wp:group {"tagName":"section","metadata":{"name":"Section Cartes avec Lien"},"className":"spck-section-cards -link","style":{"spacing":{"padding":{"top":"var:preset|spacing|70","right":"var:preset|spacing|50","left":"var:preset|spacing|50","bottom":"var:preset|spacing|80"},"blockGap":"var:preset|spacing|50"}},"layout":{"type":"constrained"}} -->
<section class="wp-block-group spck-section-cards -link" style="padding-top:var(--wp--preset--spacing--70);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--80);padding-left:var(--wp--preset--spacing--50)">
	<!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap"}} -->
	<div class="wp-block-group">
		<!-- wp:heading -->
		<h2 class="wp-block-heading">Documents</h2>
		<!-- /wp:heading -->
	</div>
	<!-- /wp:group -->

	<!-- wp:group {"className":"spck-section-cards__list","style":{"spacing":{"blockGap":"var:preset|spacing|30"}},"layout":{"type":"grid"},"lock":{"move":true,"remove":true}} -->
	<div class="wp-block-group spck-section-cards__list">
		<!-- wp:pattern {"slug":"superstack/card-link"} /-->
		<!-- wp:pattern {"slug":"superstack/card-link"} /-->
	</div>
	<!-- /wp:group -->
</section>
<!-- /wp:group -->
