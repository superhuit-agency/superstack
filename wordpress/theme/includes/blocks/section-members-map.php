<?php

namespace Superstack\Blocks;

use Superstack\Traits\Singleton;

if (! defined('ABSPATH')) {
	exit;
}

/**
 * Class used to register the Section Members Map block.
 *
 * @package    Superstack
 * @subpackage Superstack/Blocks
 * @author     Superhuit <tech@superhuit.ch>
 * @since      1.0.0
 */
class Section_Members_Map {

	use Singleton;

	/**
	 * Initialize the class.
	 *
	 * @access public
	 * @return void
	 */
	public function init() {
		add_action('init', [$this, 'register_block']);
		add_action('enqueue_block_editor_assets', [$this, 'localize_editor_data'], 20);
		add_filter('render_block_data', [$this, 'inject_members_data'], 10, 1);
	}

	/**
	 * Register the section-members-map block.
	 *
	 * @since    1.0.0
	 * @access   public
	 * @return   void
	 */
	public function register_block() {
		register_block_type(SUPERSTACK_PATH . 'blocks/section-members-map');
	}

	/**
	 * Localize block data for the editor.
	 *
	 * @since    1.0.0
	 * @access   public
	 * @return   void
	 */
	public function localize_editor_data() {
		wp_localize_script(
			SUPERSTACK_THEME_NAME . '-editor',
			'superstackSectionMembersMap',
			[
				'mapImageSrc' => get_theme_file_uri('assets/switzerland-map-editor.png'),
			]
		);
	}

	/**
	 * Inject members data into section-members-map block attributes.
	 *
	 * @since    1.0.0
	 * @access   public
	 * @param    array $parsed_block The parsed block data.
	 * @return   array
	 */
	public function inject_members_data($parsed_block) {
		if ('superstack/section-members-map' !== ($parsed_block['blockName'] ?? '')) {
			return $parsed_block;
		}

		$members = $this->get_members();

		$parsed_block['attrs']['members']  = $members;
		$parsed_block['attrs']['clusters'] = $this->build_clusters($members);

		return $parsed_block;
	}

	/**
	 * Retrieve all published members with their ACF fields.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @return   array
	 */
	private function get_members() {
		$members = [];

		$query = new \WP_Query([
			'post_type'      => 'member',
			'posts_per_page' => -1,
			'post_status'    => 'publish',
			'orderby'        => 'title',
			'order'          => 'ASC',
		]);

		foreach ($query->posts as $post) {
			$address = get_field('address', $post->ID);
			$contact = get_field('contact', $post->ID);

			$members[] = [
				'id'      => $post->ID,
				'title'   => get_the_title($post),
				'address' => $address ?: '',
				'lat'     => $address['lat'] ?? null,
				'lng'     => $address['lng'] ?? null,
				'phone'   => $contact['phone'] ?: '',
				'email'   => $contact['email'] ?: '',
				'website' => $contact['website'] ?: '',
			];
		}

		wp_reset_postdata();

		return $members;
	}

	/**
	 * Build clusters from members based on geographic proximity.
	 *
	 * Each cluster contains: x, y (percentage positions), indices (member indices), count.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @param    array $members The members data.
	 * @return   array
	 */
	private function build_clusters($members) {
		$bounds = [
			'lat_min' => 45.85,
			'lat_max' => 47.85,
			'lng_min' => 5.97,
			'lng_max' => 10.49,
		];

		$cluster_threshold = 5;
		$points            = [];

		foreach ($members as $index => $member) {
			$lat = $member['lat'];
			$lng = $member['lng'];

			if (null === $lat || null === $lng) {
				continue;
			}

			$x        = ($lng - $bounds['lng_min']) / ($bounds['lng_max'] - $bounds['lng_min']) * 100;
			$y        = (1 - ($lat - $bounds['lat_min']) / ($bounds['lat_max'] - $bounds['lat_min'])) * 100;
			$points[] = ['index' => $index, 'x' => $x, 'y' => $y];
		}

		$clusters = [];
		$assigned = [];

		foreach ($points as $i => $point) {
			if (isset($assigned[$i])) {
				continue;
			}

			$group       = [$point];
			$assigned[$i] = true;

			foreach ($points as $j => $other) {
				if (isset($assigned[$j])) {
					continue;
				}

				$distance = sqrt(pow($point['x'] - $other['x'], 2) + pow($point['y'] - $other['y'], 2));

				if ($distance <= $cluster_threshold) {
					$group[]      = $other;
					$assigned[$j] = true;
				}
			}

			$clusters[] = [
				'x'       => array_sum(array_column($group, 'x')) / count($group),
				'y'       => array_sum(array_column($group, 'y')) / count($group),
				'indices' => array_column($group, 'index'),
				'count'   => count($group),
			];
		}

		return $clusters;
	}
}

Section_Members_Map::get_instance()->init();
