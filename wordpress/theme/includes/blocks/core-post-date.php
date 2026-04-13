<?php

namespace Superstack\Blocks;

use Superstack\Traits\Singleton;
use Superstack\Post_Types\Event;

if (! defined('ABSPATH')) {
	exit;
}

/**
 * Core Post Date Block modifications.
 *
 * Displays ACF event_start_date/event_end_date for Event CPT instead of post date.
 *
 * @package    Superstack
 * @subpackage Superstack/Blocks
 * @since      1.0.0
 */
class Core_Post_Date {

	use Singleton;

	/**
	 * Day format tokens.
	 *
	 * @var string
	 */
	const DAY_TOKENS = 'djDlNSwz';

	/**
	 * Month format tokens.
	 *
	 * @var string
	 */
	const MONTH_TOKENS = 'mnMF';

	/**
	 * Year format tokens.
	 *
	 * @var string
	 */
	const YEAR_TOKENS = 'Yyo';

	/**
	 * Initialize the class.
	 *
	 * @access public
	 * @return void
	 */
	public function init() {
		add_filter('render_block_core/post-date', [$this, 'render_event_date'], 10, 3);
	}

	/**
	 * Render the event date instead of post date for Event CPT.
	 *
	 * @access public
	 * @param string   $block_content The block content.
	 * @param array    $block         The block attributes.
	 * @param WP_Block $instance      The block instance.
	 * @return string
	 */
	public function render_event_date($block_content, $block, $instance) {
		$post_id = $instance->context['postId'] ?? get_the_ID();

		if (Event::POST_TYPE !== get_post_type($post_id)) {
			return $block_content;
		}

		$start_date = get_field('event_start_date', $post_id);

		if (empty($start_date)) {
			return $block_content;
		}

		$end_date       = get_field('event_end_date', $post_id);
		$formatted_date = $this->format_event_date($start_date, $end_date);

		return preg_replace(
			'/>([^<]+)<\/time>/',
			'>' . esc_html($formatted_date) . '</time>',
			$block_content
		);
	}

	/**
	 * Format the event date according to display rules.
	 *
	 * @access private
	 * @param string      $start_date Start date (Y-m-d H:i:s format).
	 * @param string|null $end_date   End date (Y-m-d H:i:s format).
	 * @return string
	 */
	private function format_event_date($start_date, $end_date) {
		$start = \DateTime::createFromFormat('Y-m-d H:i:s', $start_date);

		if (false === $start) {
			return $start_date;
		}

		$start_has_time = '00:00:00' !== $start->format('H:i:s');

		if (empty($end_date)) {
			return $this->format_single_date($start, $start_has_time);
		}

		$end = \DateTime::createFromFormat('Y-m-d H:i:s', $end_date);

		if (false === $end) {
			return $this->format_single_date($start, $start_has_time);
		}

		$end_has_time = '00:00:00' !== $end->format('H:i:s');

		return $this->format_date_range($start, $end, $start_has_time, $end_has_time);
	}

	/**
	 * Format a single date using WordPress date format.
	 *
	 * @access private
	 * @param \DateTime $date     The date object.
	 * @param bool      $has_time Whether to include time.
	 * @return string
	 */
	private function format_single_date($date, $has_time) {
		$format = get_option('date_format');

		if ($has_time) {
			$format .= ' ' . get_option('time_format');
		}

		return date_i18n($format, $date->getTimestamp());
	}

	/**
	 * Format a date range with smart compression.
	 *
	 * @access private
	 * @param \DateTime $start          Start date.
	 * @param \DateTime $end            End date.
	 * @param bool      $start_has_time Whether start has time.
	 * @param bool      $end_has_time   Whether end has time.
	 * @return string
	 */
	private function format_date_range($start, $end, $start_has_time, $end_has_time) {
		$same_day   = $start->format('Y-m-d') === $end->format('Y-m-d');
		$same_month = $start->format('Y-m') === $end->format('Y-m');
		$same_year  = $start->format('Y') === $end->format('Y');

		if ($same_day) {
			return $this->format_same_day($start, $end, $start_has_time, $end_has_time);
		}

		$date_format = get_option('date_format');

		if ($same_month) {
			return $this->format_same_month_range($start, $end, $date_format);
		}

		if ($same_year) {
			return $this->format_same_year_range($start, $end, $date_format);
		}

		$full_format   = $date_format;
		$start_display = date_i18n($full_format, $start->getTimestamp());
		$end_display   = date_i18n($full_format, $end->getTimestamp());

		return $start_display . ' - ' . $end_display;
	}

	/**
	 * Format a same-month range.
	 *
	 * Detects format order (DMY vs MDY) and compresses accordingly:
	 * - DMY: "2-6 mars 2026" or "2-6.03.2026"
	 * - MDY: "March 2-6, 2026"
	 *
	 * @access private
	 * @param \DateTime $start       Start date.
	 * @param \DateTime $end         End date.
	 * @param string    $date_format WordPress date format.
	 * @return string
	 */
	private function format_same_month_range($start, $end, $date_format) {
		$order = $this->detect_format_order($date_format);

		if ('DMY' === $order || 'YMD' === $order) {
			$day_format      = $this->extract_day_format($date_format);
			$month_year_part = $this->remove_day_from_format($date_format);

			$start_day = date_i18n($day_format, $start->getTimestamp());
			$end_day   = date_i18n($day_format, $end->getTimestamp());
			$suffix    = date_i18n($month_year_part, $end->getTimestamp());

			return $start_day . '-' . $end_day . ' ' . ltrim($suffix, ' .,/-');
		}

		$month_part        = $this->extract_month_format($date_format);
		$day_format        = $this->extract_day_format($date_format);
		$year_part         = $this->extract_year_format($date_format);
		$separator_before  = $this->get_separator_before_year($date_format);

		$month_display = date_i18n($month_part, $start->getTimestamp());
		$start_day     = date_i18n($day_format, $start->getTimestamp());
		$end_day       = date_i18n($day_format, $end->getTimestamp());
		$year_display  = date_i18n($year_part, $end->getTimestamp());

		return $month_display . ' ' . $start_day . '-' . $end_day . $separator_before . $year_display;
	}

	/**
	 * Format a same-year range (different months).
	 *
	 * - DMY: "2 mars - 6 avril 2026"
	 * - MDY: "March 2 - April 6, 2026"
	 *
	 * @access private
	 * @param \DateTime $start       Start date.
	 * @param \DateTime $end         End date.
	 * @param string    $date_format WordPress date format.
	 * @return string
	 */
	private function format_same_year_range($start, $end, $date_format) {
		$format_no_year   = $this->remove_year_from_format($date_format);
		$year_format      = $this->extract_year_format($date_format);
		$separator_before = $this->get_separator_before_year($date_format);

		$start_display = date_i18n($format_no_year, $start->getTimestamp());
		$end_display   = date_i18n($format_no_year, $end->getTimestamp());
		$year_display  = date_i18n($year_format, $end->getTimestamp());

		return rtrim($start_display, ' .,/-') . ' - ' . rtrim($end_display, ' .,/-') . $separator_before . $year_display;
	}

	/**
	 * Format a same-day event (potentially with time range).
	 *
	 * @access private
	 * @param \DateTime $start          Start date.
	 * @param \DateTime $end            End date.
	 * @param bool      $start_has_time Whether start has time.
	 * @param bool      $end_has_time   Whether end has time.
	 * @return string
	 */
	private function format_same_day($start, $end, $start_has_time, $end_has_time) {
		$date_format = get_option('date_format');
		$time_format = get_option('time_format');
		$date_part   = date_i18n($date_format, $start->getTimestamp());

		if (! $start_has_time && ! $end_has_time) {
			return $date_part;
		}

		if ($start_has_time && $end_has_time) {
			$start_time = date_i18n($time_format, $start->getTimestamp());
			$end_time   = date_i18n($time_format, $end->getTimestamp());
			return $date_part . ' ' . $start_time . '-' . $end_time;
		}

		if ($start_has_time) {
			return $date_part . ' ' . date_i18n($time_format, $start->getTimestamp());
		}

		return $date_part;
	}

	/**
	 * Detect the order of date components in a format string.
	 *
	 * @access private
	 * @param string $format Date format string.
	 * @return string 'DMY', 'MDY', or 'YMD'
	 */
	private function detect_format_order($format) {
		$day_pos   = $this->find_first_token_position($format, self::DAY_TOKENS);
		$month_pos = $this->find_first_token_position($format, self::MONTH_TOKENS);
		$year_pos  = $this->find_first_token_position($format, self::YEAR_TOKENS);

		if (false === $day_pos) {
			$day_pos = PHP_INT_MAX;
		}
		if (false === $month_pos) {
			$month_pos = PHP_INT_MAX;
		}
		if (false === $year_pos) {
			$year_pos = PHP_INT_MAX;
		}

		if ($year_pos < $month_pos && $month_pos < $day_pos) {
			return 'YMD';
		}

		if ($month_pos < $day_pos) {
			return 'MDY';
		}

		return 'DMY';
	}

	/**
	 * Find the first position of any token from a set in the format string.
	 *
	 * @access private
	 * @param string $format Format string.
	 * @param string $tokens Token characters to search.
	 * @return int|false
	 */
	private function find_first_token_position($format, $tokens) {
		$min_pos   = false;
		$in_escape = false;

		for ($i = 0; $i < strlen($format); $i++) {
			$char = $format[$i];

			if ('\\' === $char) {
				$in_escape = true;
				continue;
			}

			if ($in_escape) {
				$in_escape = false;
				continue;
			}

			if (false !== strpos($tokens, $char)) {
				if (false === $min_pos || $i < $min_pos) {
					$min_pos = $i;
					break;
				}
			}
		}

		return $min_pos;
	}

	/**
	 * Extract day format tokens from a format string.
	 *
	 * @access private
	 * @param string $format Date format string.
	 * @return string
	 */
	private function extract_day_format($format) {
		return $this->extract_tokens($format, self::DAY_TOKENS);
	}

	/**
	 * Extract month format tokens from a format string.
	 *
	 * @access private
	 * @param string $format Date format string.
	 * @return string
	 */
	private function extract_month_format($format) {
		return $this->extract_tokens($format, self::MONTH_TOKENS);
	}

	/**
	 * Extract year format tokens from a format string.
	 *
	 * @access private
	 * @param string $format Date format string.
	 * @return string
	 */
	private function extract_year_format($format) {
		return $this->extract_tokens($format, self::YEAR_TOKENS);
	}

	/**
	 * Extract specific tokens from a format string.
	 *
	 * @access private
	 * @param string $format Format string.
	 * @param string $tokens Token characters to extract.
	 * @return string
	 */
	private function extract_tokens($format, $tokens) {
		$result    = '';
		$in_escape = false;

		for ($i = 0; $i < strlen($format); $i++) {
			$char = $format[$i];

			if ('\\' === $char) {
				$in_escape = true;
				continue;
			}

			if ($in_escape) {
				$in_escape = false;
				continue;
			}

			if (false !== strpos($tokens, $char)) {
				$result .= $char;
			}
		}

		return $result;
	}

	/**
	 * Remove day tokens from a format string.
	 *
	 * @access private
	 * @param string $format Date format string.
	 * @return string
	 */
	private function remove_day_from_format($format) {
		return $this->remove_tokens($format, self::DAY_TOKENS);
	}

	/**
	 * Remove year tokens from a format string.
	 *
	 * @access private
	 * @param string $format Date format string.
	 * @return string
	 */
	private function remove_year_from_format($format) {
		return $this->remove_tokens($format, self::YEAR_TOKENS);
	}

	/**
	 * Remove specific tokens from a format string.
	 *
	 * @access private
	 * @param string $format Format string.
	 * @param string $tokens Token characters to remove.
	 * @return string
	 */
	private function remove_tokens($format, $tokens) {
		$result    = '';
		$in_escape = false;

		for ($i = 0; $i < strlen($format); $i++) {
			$char = $format[$i];

			if ('\\' === $char) {
				$in_escape = true;
				$result   .= $char;
				continue;
			}

			if ($in_escape) {
				$in_escape = false;
				$result   .= $char;
				continue;
			}

			if (false === strpos($tokens, $char)) {
				$result .= $char;
			}
		}

		return trim($result, ' .,/-');
	}

	/**
	 * Get the separator that appears before the year in the format.
	 *
	 * @access private
	 * @param string $format Date format string.
	 * @return string
	 */
	private function get_separator_before_year($format) {
		$year_pos = $this->find_first_token_position($format, self::YEAR_TOKENS);

		if (false === $year_pos || 0 === $year_pos) {
			return ' ';
		}

		$before = substr($format, $year_pos - 1, 1);

		if (preg_match('/[,.\-\/\s]/', $before)) {
			return $before;
		}

		return ' ';
	}
}

Core_Post_Date::get_instance()->init();
