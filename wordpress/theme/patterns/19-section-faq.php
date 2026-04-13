<?php

/**
 * Title: Section FAQ
 * Slug: superstack/section-faq
 * Categories: text
 * Description: Afficher une section contenant les questions fréquemment posées.
 *
 * @package    Superstack
 * @subpackage Superstack/patterns
 * @since      1.0.0
 */

?>
<!-- wp:group {"tagName":"section","metadata":{"categories":["content"],"patternName":"superstack/section-faq","name":"Section FAQ"},"align":"full","className":"spck-section-faq","style":{"spacing":{"padding":{"top":"var:preset|spacing|100","bottom":"var:preset|spacing|100","left":"0","right":"0"}}},"layout":{"type":"constrained"},"allowedBlocks":[]} -->
<section class="wp-block-group alignfull spck-section-faq" style="padding-top:var(--wp--preset--spacing--100);padding-right:0;padding-bottom:var(--wp--preset--spacing--100);padding-left:0">
	<!-- wp:group {"lock":{"move":true,"remove":true},"className":"spck-section-faq__inner","style":{"spacing":{"blockGap":"var:preset|spacing|50"}},"layout":{"type":"flex","orientation":"vertical"}} -->
	<div class="wp-block-group spck-section-faq__inner">
		<!-- wp:heading {"lock":{"move":true,"remove":true}} -->
		<h2 class="wp-block-heading">Questions fréquentes</h2>
		<!-- /wp:heading -->

		<!-- wp:group {"lock":{"move":true,"remove":true},"className":"spck-section-faq_list","style":{"spacing":{"padding":{"top":"0px"},"blockGap":"0"},"layout":{"selfStretch":"fit","flexSize":null}},"layout":{"type":"flex","orientation":"vertical"},"allowedBlocks":["core/details"]} -->
		<div class="wp-block-group spck-section-faq_list" style="padding-top:0px">
			<!-- wp:details -->
			<details class="wp-block-details">
				<summary>Comment est organisé la Superstack ?</summary>
				<!-- wp:paragraph {"placeholder":"Type / to add a hidden block"} -->
				<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
				<!-- /wp:paragraph -->
			</details>
			<!-- /wp:details -->

			<!-- wp:details -->
			<details class="wp-block-details">
				<summary>Comment devenir membre ?</summary>
				<!-- wp:paragraph {"placeholder":"Type / to add a hidden block"} -->
				<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
				<!-- /wp:paragraph -->
			</details>
			<!-- /wp:details -->
		</div>
		<!-- /wp:group -->
	</div>
	<!-- /wp:group -->
</section>
<!-- /wp:group -->
