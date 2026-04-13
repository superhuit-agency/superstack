<?php

namespace Superstack\Traits;

if (! defined('ABSPATH')) {
	exit;
}

/**
 * Singleton pattern trait.
 *
 * Provides a reusable singleton implementation for classes
 * that should only have one instance throughout the application.
 *
 * @package    Superstack
 * @subpackage Superstack/Traits
 * @author     Superhuit <tech@superhuit.ch>
 * @since      1.0.0
 */
trait Singleton {

	/**
	 * Gets an instance of this class.
	 * Prevents duplicate instances which avoid artefacts and improves performance.
	 *
	 * @static
	 * @access public
	 * @since  1.0.0
	 * @return static
	 */
	public static function get_instance(): static {
		static $instance = null;

		if (null === $instance) {
			$instance = new static();
		}

		return $instance;
	}

	/**
	 * Empty constructor - prevent direct instantiation.
	 *
	 * @access private
	 */
	private function __construct() {
	}

	/**
	 * Prevent cloning of the instance.
	 *
	 * @access private
	 */
	private function __clone() {
	}

	/**
	 * Prevent unserialization of the instance.
	 *
	 * @access public
	 * @throws \Exception Throws exception on unserialize attempt.
	 */
	public function __wakeup() {
		throw new \Exception('Cannot unserialize singleton.');
	}
}
