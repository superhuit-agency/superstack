<?php

/**
 * Title: Page Connexion
 * Slug: superstack/page-login
 * Categories: pages
 * Description: Page de connexion avec formulaire.
 * Inserter: false
 *
 * @package    Superstack
 * @subpackage Superstack/patterns
 * @since      1.0.0
 */

?>
<!-- wp:group {"tagName":"section","metadata":{"name":"Page Connexion"},"className":"spck-page-login","style":{"spacing":{"padding":{"top":"var:preset|spacing|100","bottom":"var:preset|spacing|100","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}}},"layout":{"type":"constrained","contentSize":"480px"}} -->
<section class="wp-block-group spck-page-login" style="padding-top:var(--wp--preset--spacing--100);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--100);padding-left:var(--wp--preset--spacing--50)">
	<!-- wp:heading -->
	<h2 class="wp-block-heading"><?php esc_html_e('Connexion', 'superstack'); ?></h2>
	<!-- /wp:heading -->

	<!-- wp:paragraph -->
	<p><?php esc_html_e('Connectez-vous pour accéder au contenu réservé aux membres.', 'superstack'); ?></p>
	<!-- /wp:paragraph -->

	<!-- wp:loginout {"displayLoginAsForm":true} /-->

	<!-- wp:paragraph {"fontSize":"small"} -->
	<p class="has-small-font-size"><a href="<?php echo esc_url(wp_lostpassword_url()); ?>"><?php esc_html_e('Mot de passe oublié ?', 'superstack'); ?></a></p>
	<!-- /wp:paragraph -->
</section>
<!-- /wp:group -->
