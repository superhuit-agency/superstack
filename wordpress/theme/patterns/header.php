<?php

/**
 * Title: En-tête du site
 * Slug: superstack/header
 * Categories: header
 * Block Types: core/template-part/header
 * Description: En-tête du site avec logo, navigation et bouton de soutien.
 * Inserter: false
 *
 * @package    Superstack
 * @subpackage Superstack/patterns
 * @since      1.0.0
 */
?>
<!-- wp:group {"className":"spck-header","layout":{"type":"constrained"}} -->
<div class="wp-block-group spck-header">
	<!-- wp:group {"style":{"spacing":{"blockGap":"16px","margin":{"top":"0","bottom":"0"},"padding":{"right":"var:preset|spacing|50","left":"var:preset|spacing|50","top":"var:preset|spacing|20","bottom":"var:preset|spacing|20"}}},"layout":{"type":"flex","flexWrap":"nowrap"}} -->
	<div class="wp-block-group" style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--20);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--20);padding-left:var(--wp--preset--spacing--50)">
		<!-- wp:site-logo {"shouldSyncIcon":false} /-->

		<!-- wp:group {"className":"is-style-default spck-header__wrap","style":{"layout":{"selfStretch":"fill","flexSize":null}},"layout":{"type":"flex","flexWrap":"nowrap"}} -->
		<div class="wp-block-group is-style-default spck-header__wrap">
			<!-- wp:navigation {"style":{"layout":{"selfStretch":"fit","flexSize":null}}} /-->
		</div>
		<!-- /wp:group -->

		<!-- wp:buttons -->
		<div class="wp-block-buttons">
			<!-- wp:button -->
			<div class="wp-block-button"><a class="wp-block-button__link wp-element-button">Nous soutenir</a></div>
			<!-- /wp:button -->
		</div>
		<!-- /wp:buttons -->
	</div>
	<!-- /wp:group -->
</div>
<!-- /wp:group -->
