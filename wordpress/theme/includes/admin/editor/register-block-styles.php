<?php

namespace Superstack\Admin\Editor;

use Superstack\Traits\Singleton;

if (! defined('ABSPATH')) {
	exit;
}

/**
 * Class used to register custom block styles.
 *
 * @package    Superstack
 * @subpackage Superstack/Admin/Editor
 * @author     Superhuit <tech@superhuit.ch>
 */
class Register_Block_Styles
{

	use Singleton;

	/**
	 * Initialize the class.
	 *
	 * @access public
	 * @return void
	 */
	public function init()
	{
		add_action('init', [$this, 'register_button_link_style']);
		// add_action('init', [$this, 'register_group_accent_style']);
	}

	/**
	 * Register the "link" style variation for core/button block.
	 *
	 * @since    1.0.0
	 * @access   public
	 * @return   void
	 */
	public function register_button_link_style()
	{
		register_block_style(
			'core/button',
			[
				'name'  => 'link',
				'label' => _x('Lien', 'core/button block style', SUPERSTACK_THEME_NAME),
			]
		);
	}

	// /**
	//  * Register the "Accent" style for core/group block.
	//  *
	//  * @since    1.0.0
	//  * @access   public
	//  * @return   void
	//  */
	// public function register_group_accent_style() {
	// 	register_block_style(
	// 		'core/group',
	// 		[
	// 			'name'         => 'accent',
	// 			'label'        => _x('Accent', 'core/group block style', SUPERSTACK_THEME_NAME),
	// 			'inline_style' => '.wp-block-group.is-style-accent { background-color: var(--wp--preset--color--accent-7); }',
	// 		]
	// 	);
	// }
}

Register_Block_Styles::get_instance()->init();
