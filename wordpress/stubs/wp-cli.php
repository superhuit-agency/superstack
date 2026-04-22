<?php

/**
 * WP-CLI stubs for IDE autocompletion.
 *
 * This file is never loaded at runtime. It only provides type hints
 * so that intelephense can resolve WP-CLI classes and functions.
 *
 * @package Superstack - Future
 */

define('WP_CLI', true);

class WP_CLI {

	/**
	 * @param string          $name
	 * @param callable|string $callable
	 * @param array           $args
	 * @return void
	 */
	public static function add_command($name, $callable, $args = []) {
	}

	/**
	 * @param string $message
	 * @return void
	 */
	public static function log($message) {
	}

	/**
	 * @param string $message
	 * @return void
	 */
	public static function success($message) {
	}

	/**
	 * @param string $message
	 * @return void
	 */
	public static function warning($message) {
	}

	/**
	 * @param string $message
	 * @return void
	 */
	public static function error($message) {
	}

	/**
	 * @param string $command
	 * @param array  $options
	 * @return mixed
	 */
	public static function runcommand($command, $options = []) {
	}
}

namespace WP_CLI\Utils;

/**
 * @param array  $assoc_args
 * @param string $flag
 * @param mixed  $default
 * @return mixed
 */
function get_flag_value($assoc_args, $flag, $default = null) {
}

/**
 * @param string $format
 * @param array  $items
 * @param array  $fields
 * @return void
 */
function format_items($format, $items, $fields) {
}
