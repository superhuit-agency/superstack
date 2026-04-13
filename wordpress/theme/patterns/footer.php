<?php

/**
 * Title: Footer
 * Slug: superstack/footer
 * Categories: footer
 * Block Types: core/template-part/footer
 * Description: Footer columns with logo, title, tagline and links.
 * Inserter: false
 *
 * @package    Superstack
 * @subpackage Superstack/patterns
 * @since      1.0.0
 */

?>
<!-- wp:group {"className":"spck-footer","style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50","left":"var:preset|spacing|50","right":"var:preset|spacing|50"}}},"layout":{"type":"flex","orientation":"vertical"}} -->
<div class="wp-block-group spck-footer" style="padding-top:var(--wp--preset--spacing--50);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50);padding-left:var(--wp--preset--spacing--50)">
	<!-- wp:group {"align":"full","className":"spck-footer__top","style":{"layout":{"selfStretch":"fill","flexSize":null}},"layout":{"type":"flex","flexWrap":"wrap","justifyContent":"space-between","verticalAlignment":"top"}} -->
	<div class="wp-block-group alignfull spck-footer__top">
		<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|30"}},"layout":{"type":"constrained"}} -->
		<div class="wp-block-group">
			<!-- wp:heading {"level":3} -->
			<h3 class="wp-block-heading">Abonnez-vous à notre <br>newsletter pour rester informé <br>de l'actualité de la Superstack</h3>
			<!-- /wp:heading -->

			<!-- wp:buttons -->
			<div class="wp-block-buttons">
				<!-- wp:button -->
				<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="#">S'inscrire</a></div>
				<!-- /wp:button -->
			</div>
			<!-- /wp:buttons -->
		</div>
		<!-- /wp:group -->

		<!-- wp:group {"className":"spck-footer__nav-list","style":{"spacing":{"blockGap":"var:preset|spacing|20"}},"layout":{"type":"flex","orientation":"vertical"}} -->
		<div class="wp-block-group spck-footer__nav-list">
			<!-- wp:navigation {"overlayMenu":"never","style":{"spacing":{"blockGap":"var:preset|spacing|20"},"layout":{"selfStretch":"fill","flexSize":null}},"fontSize":"large","layout":{"type":"flex","orientation":"vertical"}} -->
			<!-- wp:navigation-link {"label":"<?php esc_html_e('Contact', 'superstack'); ?>","url":"#"} /-->
			<!-- wp:navigation-link {"label":"<?php esc_html_e('Partenaires', 'superstack'); ?>","url":"#"} /-->
			<!-- wp:navigation-link {"label":"<?php esc_html_e('Ressources', 'superstack'); ?>","url":"#"} /-->
			<!-- wp:navigation-link {"label":"<?php esc_html_e('Archives', 'superstack'); ?>","url":"#"} /-->
			<!-- wp:navigation-link {"label":"<?php esc_html_e('Intranet', 'superstack'); ?>","url":"#"} /-->
			<!-- /wp:navigation -->

			<!-- wp:separator -->
			<hr class="wp-block-separator has-alpha-channel-opacity" />
			<!-- /wp:separator -->

			<!-- wp:navigation {"overlayMenu":"never","style":{"spacing":{"blockGap":"var:preset|spacing|20"},"layout":{"selfStretch":"fill","flexSize":null}},"fontSize":"large","layout":{"type":"flex","orientation":"vertical"}} -->
			<!-- wp:navigation-link {"label":"<?php esc_html_e('LinkedIn', 'superstack'); ?>","url":"https://www.linkedin.com/company/superstack/"} /-->
			<!-- /wp:navigation -->
		</div>
		<!-- /wp:group -->
	</div>
	<!-- /wp:group -->

	<!-- wp:group {"align":"full","className":"spck-footer__bottom","style":{"spacing":{"blockGap":"var:preset|spacing|30"},"layout":{"selfStretch":"fill","flexSize":null}},"layout":{"type":"flex","orientation":"vertical"}} -->
	<div class="wp-block-group alignfull spck-footer__bottom">
		<!-- wp:group {"className":"spck-footer__partner-list","style":{"spacing":{"blockGap":"var:preset|spacing|30"},"layout":{"selfStretch":"fill","flexSize":null}},"layout":{"type":"flex","flexWrap":"nowrap"}} -->
		<div class="wp-block-group spck-footer__partner-list">
			<!-- wp:paragraph {"fontSize":"small"} -->
			<p class="has-small-font-size">Partenaire de</p>
			<!-- /wp:paragraph -->

			<!-- wp:image {"sizeSlug":"large","url":""<?php echo esc_url(get_theme_file_uri('assets/logo-santepsy.ch.svg')); ?>"} -->
			<figure class="wp-block-image size-large"><a href="https://santepsy.ch/" target="_blank" rel="noreferrer noopener"><img src="<?php echo esc_url(get_theme_file_uri('assets/logo-santepsy.ch.svg')); ?>" alt="SantéPsy.ch" /></a></figure>
			<!-- /wp:image -->

			<!-- wp:image {"sizeSlug":"large","url":"<?php echo esc_url(get_theme_file_uri('assets/logo-reseau-sante-psychique-suisse.svg')); ?>"} -->
			<figure class="wp-block-image size-large"><a href="https://www.npg-rsp.ch/fr/home.html" target="_blank" rel="noreferrer noopener"><img src="<?php echo esc_url(get_theme_file_uri('assets/logo-reseau-sante-psychique-suisse.svg')); ?>" alt="Réseau santé psychique suisse" /></a></figure>
			<!-- /wp:image -->
		</div>
		<!-- /wp:group -->

		<!-- wp:separator -->
		<hr class="wp-block-separator has-alpha-channel-opacity" />
		<!-- /wp:separator -->

		<!-- wp:group {"className":"spck-footer__legal","style":{"layout":{"selfStretch":"fill","flexSize":null}},"layout":{"type":"flex","flexWrap":"nowrap"}} -->
		<div class="wp-block-group spck-footer__legal">
			<!-- wp:paragraph {"fontSize":"small"} -->
			<p class="has-small-font-size">Superstack © 2026. Tous droits réservés.</p>
			<!-- /wp:paragraph -->


			<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|30"}},"layout":{"type":"flex","flexWrap":"nowrap"}} -->
			<div class="wp-block-group">
				<!-- wp:loginout {"fontSize":"small"} /-->

				<!-- wp:navigation {"overlayMenu":"never","style":{"spacing":{"blockGap":"var:preset|spacing|30"}},"fontSize":"small"} -->
				<!-- wp:navigation-link {"label":"<?php esc_html_e('Politique de confidentialité', 'superstack'); ?>","url":"#"} /-->
				<!-- wp:navigation-link {"label":"<?php esc_html_e('Conditions d’utilisation', 'superstack'); ?>","url":"#"} /-->
				<!-- wp:navigation-link {"label":"<?php esc_html_e('Gérer les cookies', 'superstack'); ?>","url":"#"} /-->
				<!-- /wp:navigation -->
			</div>
			<!-- /wp:group -->
		</div>
		<!-- /wp:group -->
	</div>
	<!-- /wp:group -->
</div>
<!-- /wp:group -->
