<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Cookie_Analytics_DB {

	/**
	 * Get the events table name.
	 */
	public static function events_table() {
		global $wpdb;
		return $wpdb->prefix . 'cookie_analytics';
	}

	/**
	 * Get the blacklist table name.
	 */
	public static function blacklist_table() {
		global $wpdb;
		return $wpdb->prefix . 'cookie_analytics_blacklist';
	}

	/**
	 * Create the database tables on plugin activation.
	 */
	public static function create_tables() {
		global $wpdb;
		$charset_collate = $wpdb->get_charset_collate();

		$events_table    = self::events_table();
		$blacklist_table = self::blacklist_table();

		$sql_events = "CREATE TABLE $events_table (
			id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
			event_type VARCHAR(20) NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			INDEX idx_event_type (event_type),
			INDEX idx_created_at (created_at)
		) $charset_collate;";

		$sql_blacklist = "CREATE TABLE $blacklist_table (
			id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
			ip_address VARCHAR(45) NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			UNIQUE INDEX idx_ip (ip_address)
		) $charset_collate;";

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta( $sql_events );
		dbDelta( $sql_blacklist );
	}

	/**
	 * Insert a new event record.
	 *
	 * @param string $event_type One of: impression, accept, reject, personalize.
	 * @return bool|int False on failure, number of rows inserted on success.
	 */
	public static function insert_event( $event_type ) {
		global $wpdb;

		$allowed_types = [ 'impression', 'accept', 'reject', 'personalize' ];
		if ( ! in_array( $event_type, $allowed_types, true ) ) {
			return false;
		}

		return $wpdb->insert(
			self::events_table(),
			[
				'event_type' => $event_type,
				'created_at' => current_time( 'mysql' ),
			],
			[ '%s', '%s' ]
		);
	}

	/**
	 * Get aggregated event counts for a date range.
	 *
	 * @param string|null $start_date Start date (Y-m-d). Null for all time.
	 * @param string|null $end_date   End date (Y-m-d). Null for all time.
	 * @return array Associative array of event_type => count.
	 */
	public static function get_event_counts( $start_date = null, $end_date = null ) {
		global $wpdb;
		$table = self::events_table();

		$where = '';
		$params = [];

		if ( $start_date && $end_date ) {
			$where = 'WHERE created_at >= %s AND created_at < %s';
			$params[] = $start_date . ' 00:00:00';
			$params[] = date( 'Y-m-d', strtotime( $end_date . ' +1 day' ) ) . ' 00:00:00';
		} elseif ( $start_date ) {
			$where = 'WHERE created_at >= %s';
			$params[] = $start_date . ' 00:00:00';
		} elseif ( $end_date ) {
			$where = 'WHERE created_at < %s';
			$params[] = date( 'Y-m-d', strtotime( $end_date . ' +1 day' ) ) . ' 00:00:00';
		}

		$sql = "SELECT event_type, COUNT(*) as count FROM $table $where GROUP BY event_type";

		if ( ! empty( $params ) ) {
			$sql = $wpdb->prepare( $sql, $params );
		}

		$results = $wpdb->get_results( $sql, ARRAY_A );

		$counts = [
			'impression'  => 0,
			'accept'      => 0,
			'reject'      => 0,
			'personalize' => 0,
		];

		if ( $results ) {
			foreach ( $results as $row ) {
				$counts[ $row['event_type'] ] = (int) $row['count'];
			}
		}

		return $counts;
	}

	/**
	 * Get daily event counts for charting.
	 *
	 * @param string|null $start_date Start date (Y-m-d).
	 * @param string|null $end_date   End date (Y-m-d).
	 * @return array Array of [ date => [ event_type => count ] ].
	 */
	public static function get_daily_counts( $start_date = null, $end_date = null ) {
		global $wpdb;
		$table = self::events_table();

		$where = '';
		$params = [];

		if ( $start_date && $end_date ) {
			$where = 'WHERE created_at >= %s AND created_at < %s';
			$params[] = $start_date . ' 00:00:00';
			$params[] = date( 'Y-m-d', strtotime( $end_date . ' +1 day' ) ) . ' 00:00:00';
		} elseif ( $start_date ) {
			$where = 'WHERE created_at >= %s';
			$params[] = $start_date . ' 00:00:00';
		} elseif ( $end_date ) {
			$where = 'WHERE created_at < %s';
			$params[] = date( 'Y-m-d', strtotime( $end_date . ' +1 day' ) ) . ' 00:00:00';
		}

		$sql = "SELECT DATE(created_at) as date, event_type, COUNT(*) as count
				FROM $table
				$where
				GROUP BY DATE(created_at), event_type
				ORDER BY date ASC";

		if ( ! empty( $params ) ) {
			$sql = $wpdb->prepare( $sql, $params );
		}

		$results = $wpdb->get_results( $sql, ARRAY_A );

		$daily = [];
		if ( $results ) {
			foreach ( $results as $row ) {
				$date = $row['date'];
				if ( ! isset( $daily[ $date ] ) ) {
					$daily[ $date ] = [
						'impression'  => 0,
						'accept'      => 0,
						'reject'      => 0,
						'personalize' => 0,
					];
				}
				$daily[ $date ][ $row['event_type'] ] = (int) $row['count'];
			}
		}

		return $daily;
	}

	/**
	 * Check if an IP is blacklisted.
	 *
	 * @param string $ip IP address to check.
	 * @return bool True if blacklisted.
	 */
	public static function is_ip_blacklisted( $ip ) {
		global $wpdb;
		$table = self::blacklist_table();

		$result = $wpdb->get_var(
			$wpdb->prepare( "SELECT COUNT(*) FROM $table WHERE ip_address = %s", $ip )
		);

		return (int) $result > 0;
	}

	/**
	 * Get all blacklisted IPs.
	 *
	 * @return array Array of blacklist records.
	 */
	public static function get_blacklist() {
		global $wpdb;
		$table = self::blacklist_table();

		return $wpdb->get_results( "SELECT * FROM $table ORDER BY created_at DESC", ARRAY_A );
	}

	/**
	 * Add an IP to the blacklist.
	 *
	 * @param string $ip IP address to blacklist.
	 * @return bool|int False on failure, number of rows on success.
	 */
	public static function add_to_blacklist( $ip ) {
		global $wpdb;

		$ip = sanitize_text_field( trim( $ip ) );
		if ( ! filter_var( $ip, FILTER_VALIDATE_IP ) ) {
			return false;
		}

		return $wpdb->replace(
			self::blacklist_table(),
			[
				'ip_address' => $ip,
				'created_at' => current_time( 'mysql' ),
			],
			[ '%s', '%s' ]
		);
	}

	/**
	 * Remove an IP from the blacklist.
	 *
	 * @param int $id Blacklist record ID.
	 * @return bool|int False on failure, number of rows deleted on success.
	 */
	public static function remove_from_blacklist( $id ) {
		global $wpdb;

		return $wpdb->delete(
			self::blacklist_table(),
			[ 'id' => (int) $id ],
			[ '%d' ]
		);
	}

	/**
	 * Delete all analytics event data.
	 *
	 * @return bool True on success, false on failure.
	 */
	public static function truncate_events() {
		global $wpdb;
		$table = self::events_table();

		return $wpdb->query( "TRUNCATE TABLE $table" ) !== false;
	}

	/**
	 * Delete events older than a given number of days.
	 *
	 * @param int $days Number of days to retain.
	 * @return int|false Number of rows deleted, or false on failure.
	 */
	public static function delete_events_older_than( $days ) {
		global $wpdb;
		$table = self::events_table();
		$days  = absint( $days );

		return $wpdb->query(
			$wpdb->prepare(
				"DELETE FROM $table WHERE created_at < DATE_SUB(NOW(), INTERVAL %d DAY)",
				$days
			)
		);
	}

	/**
	 * Get the configured retention period in days (0 = keep forever).
	 *
	 * @return int
	 */
	public static function get_retention_days() {
		return (int) get_option( 'cookie_analytics_retention_days', 0 );
	}

	/**
	 * Save the retention period.
	 *
	 * @param int $days Number of days (0 = keep forever).
	 */
	public static function set_retention_days( $days ) {
		update_option( 'cookie_analytics_retention_days', absint( $days ) );
	}
}
