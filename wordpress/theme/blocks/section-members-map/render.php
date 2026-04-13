<?php

/**
 * Server-side rendering for the superstack/section-members-map block.
 *
 * @package Superstack
 * @since   1.0.0
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block default content.
 * @var WP_Block $block      Block instance.
 */

if (! defined('ABSPATH')) {
	exit;
}
?>
<<?php echo esc_attr($attributes['tagName']); ?> <?php echo get_block_wrapper_attributes(['class' => 'spck-section-members-map']); ?>>
	<div class="spck-section-members-map__inner">
		<?php echo $content; ?>

		<div class="spck-section-members-map__members">
			<div class="spck-section-members-map__members__inner">
				<ul class="spck-section-members-map__members__list">
					<?php foreach ($attributes['members'] as $member) : ?>
						<li class="spck-section-members-map__member">
							<h3 class="spck-section-members-map__member__name"><?php echo esc_html($member['title']); ?></h3>
							<div class="spck-section-members-map__member__content">
								<p class="spck-section-members-map__member__address"><?php echo esc_html($member['address']['name'] ?? "{$member['address']['street_name']} {$member['address']['street_number']}"); ?><br /><?php echo esc_html($member['address']['post_code']); ?> <?php echo esc_html($member['address']['city']); ?></p>
								<div class="spck-section-members-map__member__infos">
									<p class="spck-section-members-map__member__phone"><?php echo esc_html($member['phone']); ?></p>
									<?php if ($member['email']) : ?><p class="spck-section-members-map__member__email"><a href="mailto:<?php echo esc_html($member['email']); ?>"><?php echo esc_html($member['email']); ?></a></p><?php endif; ?>
									<?php if ($member['website']) : ?><p class="spck-section-members-map__member__website"><a href="<?php echo esc_html($member['website']); ?>" target="_blank"><?php _e('Voir le site', 'superstack'); ?></a></p><?php endif; ?>
								</div>
							</div>
						</li>
					<?php endforeach; ?>
				</ul>
			</div>
		</div>

		<div class="spck-section-members-map__map">
			<div class="spck-section-members-map__pins">
				<?php foreach ($attributes['clusters'] as $cluster) :
					$indices = implode(',', $cluster['indices']);
					$is_cluster = $cluster['count'] > 1;

					if ($is_cluster) :
						$label = sprintf(__('%d membres', 'superstack'), $cluster['count']);
					else :
						$label = $attributes['members'][$cluster['indices'][0]]['title'];
					endif;
				?>
					<button class="spck-section-members-map__pin<?php echo $is_cluster ? ' -cluster' : ''; ?>" style="left: <?php echo esc_attr($cluster['x']); ?>%; top: <?php echo esc_attr($cluster['y']); ?>%;" data-member-indices="<?php echo esc_attr($indices); ?>" aria-label="<?php echo esc_attr($label); ?>">
						<svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 45 45" fill="none">
							<ellipse cx="22.0482" cy="36.7473" rx="7.34946" ry="2.75605" fill="#191919" />
							<path d="M22.0488 3.6748C27.5608 3.67499 33.0723 7.34997 33.0723 14.6992C33.0721 22.0485 28.4794 29.3978 22.0488 36.7471C15.6181 29.3977 11.0246 22.0485 11.0244 14.6992C11.0244 7.34978 16.5368 3.6748 22.0488 3.6748ZM22.0488 10.4316C19.7294 10.4316 17.8486 12.3424 17.8486 14.6992C17.8488 17.0559 19.7295 18.9658 22.0488 18.9658C24.3679 18.9656 26.2478 17.0557 26.248 14.6992C26.248 12.3425 24.3681 10.4319 22.0488 10.4316Z" fill="#FF9838" />
						</svg>
						<?php if ($is_cluster) : ?>
							<span class="spck-section-members-map__cluster-count"><?php echo esc_html($cluster['count']); ?></span>
						<?php endif; ?>
					</button>
				<?php endforeach; ?>
			</div>
			<img class="spck-section-members-map__map-image" src="<?php echo esc_url(get_theme_file_uri('assets/switzerland-map.svg')); ?>" alt="" />
		</div>
	</div>
</<?php echo esc_attr($attributes['tagName']); ?>>
