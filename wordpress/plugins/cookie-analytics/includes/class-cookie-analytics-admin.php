<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Cookie_Analytics_Admin {

	public function __construct() {
		add_action( 'admin_menu', [ $this, 'add_admin_menu' ] );
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_assets' ] );
		add_action( 'admin_init', [ $this, 'handle_blacklist_actions' ] );
		add_action( 'admin_init', [ $this, 'handle_danger_zone_actions' ] );
		add_action( 'admin_init', [ $this, 'handle_retention_settings' ] );
		add_action( 'admin_init', [ $this, 'handle_csv_export' ] );
	}

	/**
	 * Register the top-level admin menu page.
	 */
	public function add_admin_menu() {
		add_menu_page(
			__( 'Cookie Analytics', 'cookie-analytics' ),
			__( 'Cookie Analytics', 'cookie-analytics' ),
			'manage_options',
			'cookie-analytics',
			[ $this, 'render_page' ],
			'dashicons-chart-bar',
			30
		);
	}

	/**
	 * Enqueue admin styles and Chart.js on our admin page only.
	 */
	public function enqueue_assets( $hook ) {
		if ( 'toplevel_page_cookie-analytics' !== $hook ) {
			return;
		}

		wp_enqueue_style(
			'cookie-analytics-admin',
			COOKIE_ANALYTICS_PLUGIN_URL . 'assets/admin.css',
			[],
			COOKIE_ANALYTICS_VERSION
		);

		wp_enqueue_script(
			'chartjs',
			'https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js',
			[],
			'4.4.0',
			true
		);

		wp_enqueue_script(
			'cookie-analytics-admin',
			COOKIE_ANALYTICS_PLUGIN_URL . 'assets/admin.js',
			[ 'chartjs' ],
			COOKIE_ANALYTICS_VERSION,
			true
		);
	}

	/**
	 * Handle blacklist add/remove form submissions.
	 */
	public function handle_blacklist_actions() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		// Add IP to blacklist
		if (
			isset( $_POST['cookie_analytics_add_ip'] ) &&
			wp_verify_nonce( $_POST['_wpnonce_blacklist'], 'cookie_analytics_blacklist' )
		) {
			$ip = sanitize_text_field( $_POST['blacklist_ip'] ?? '' );
			if ( $ip ) {
				$result = Cookie_Analytics_DB::add_to_blacklist( $ip );
				if ( false === $result ) {
					add_settings_error( 'cookie-analytics', 'invalid-ip', __( 'Invalid IP address.', 'cookie-analytics' ), 'error' );
				} else {
					add_settings_error( 'cookie-analytics', 'ip-added', __( 'IP address added to blacklist.', 'cookie-analytics' ), 'success' );
				}
			}
		}

		// Remove IP from blacklist
		if (
			isset( $_GET['action'] ) && $_GET['action'] === 'remove_ip' &&
			isset( $_GET['id'] ) &&
			wp_verify_nonce( $_GET['_wpnonce'], 'remove_ip_' . $_GET['id'] )
		) {
			Cookie_Analytics_DB::remove_from_blacklist( (int) $_GET['id'] );
			wp_redirect( admin_url( 'admin.php?page=cookie-analytics' ) );
			exit;
		}
	}

	/**
	 * Handle danger zone form submissions (delete all data).
	 */
	public function handle_danger_zone_actions() {
		if (
			isset( $_POST['cookie_analytics_delete_all'] ) &&
			wp_verify_nonce( $_POST['_wpnonce_danger_zone'], 'cookie_analytics_danger_zone' )
		) {
			if ( ! current_user_can( 'manage_options' ) ) {
				return;
			}

			$confirm = sanitize_text_field( $_POST['confirm_delete'] ?? '' );
			if ( 'DELETE' !== $confirm ) {
				add_settings_error( 'cookie-analytics', 'delete-not-confirmed', __( 'You must type DELETE to confirm.', 'cookie-analytics' ), 'error' );
				return;
			}

			$result = Cookie_Analytics_DB::truncate_events();
			if ( $result ) {
				add_settings_error( 'cookie-analytics', 'data-deleted', __( 'All analytics data has been deleted.', 'cookie-analytics' ), 'success' );
			} else {
				add_settings_error( 'cookie-analytics', 'delete-failed', __( 'Failed to delete analytics data.', 'cookie-analytics' ), 'error' );
			}
		}
	}

	/**
	 * Handle retention settings form submission.
	 */
	public function handle_retention_settings() {
		if (
			isset( $_POST['cookie_analytics_save_retention'] ) &&
			wp_verify_nonce( $_POST['_wpnonce_retention'], 'cookie_analytics_retention' )
		) {
			if ( ! current_user_can( 'manage_options' ) ) {
				return;
			}

			$days = isset( $_POST['retention_days'] ) ? absint( $_POST['retention_days'] ) : 0;
			Cookie_Analytics_DB::set_retention_days( $days );

			// If retention is set, run an immediate cleanup
			if ( $days > 0 ) {
				$deleted = Cookie_Analytics_DB::delete_events_older_than( $days );
				add_settings_error(
					'cookie-analytics',
					'retention-saved',
					sprintf(
						/* translators: 1: retention days, 2: number of deleted rows */
						__( 'Retention set to %1$d days. %2$d old record(s) cleaned up.', 'cookie-analytics' ),
						$days,
						max( 0, (int) $deleted )
					),
					'success'
				);
			} else {
				add_settings_error( 'cookie-analytics', 'retention-saved', __( 'Retention set to keep all data.', 'cookie-analytics' ), 'success' );
			}

			// Ensure cron is scheduled
			if ( ! wp_next_scheduled( 'cookie_analytics_daily_cleanup' ) ) {
				wp_schedule_event( time(), 'daily', 'cookie_analytics_daily_cleanup' );
			}
		}
	}

	/**
	 * Handle CSV export. Must run before any HTML output.
	 */
	public function handle_csv_export() {
		if (
			! isset( $_GET['action'] ) ||
			'export_csv' !== $_GET['action'] ||
			! isset( $_GET['page'] ) ||
			'cookie-analytics' !== $_GET['page']
		) {
			return;
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		if ( ! wp_verify_nonce( $_GET['_wpnonce'], 'cookie_analytics_export_csv' ) ) {
			wp_die( __( 'Invalid nonce.', 'cookie-analytics' ) );
		}

		// Get date filters
		$start_date = isset( $_GET['start_date'] ) ? sanitize_text_field( $_GET['start_date'] ) : null;
		$end_date   = isset( $_GET['end_date'] ) ? sanitize_text_field( $_GET['end_date'] ) : null;

		if ( $start_date && ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', $start_date ) ) {
			$start_date = null;
		}
		if ( $end_date && ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', $end_date ) ) {
			$end_date = null;
		}

		$daily  = Cookie_Analytics_DB::get_daily_counts( $start_date, $end_date );
		$counts = Cookie_Analytics_DB::get_event_counts( $start_date, $end_date );

		// Build filename
		$filename = 'cookie-analytics';
		if ( $start_date ) {
			$filename .= '-from-' . $start_date;
		}
		if ( $end_date ) {
			$filename .= '-to-' . $end_date;
		}
		$filename .= '.csv';

		// Send headers
		header( 'Content-Type: text/csv; charset=utf-8' );
		header( 'Content-Disposition: attachment; filename="' . $filename . '"' );
		header( 'Pragma: no-cache' );
		header( 'Expires: 0' );

		$output = fopen( 'php://output', 'w' );

		// Header row
		fputcsv( $output, [ 'Date', 'Impressions', 'Accepts', 'Rejects', 'Personalize', 'Acceptance Rate (%)', 'Rejection Rate (%)' ] );

		// Daily rows
		foreach ( $daily as $date => $day_counts ) {
			$imp = max( $day_counts['impression'], 1 );
			fputcsv( $output, [
				$date,
				$day_counts['impression'],
				$day_counts['accept'],
				$day_counts['reject'],
				$day_counts['personalize'],
				round( ( $day_counts['accept'] / $imp ) * 100, 1 ),
				round( ( $day_counts['reject'] / $imp ) * 100, 1 ),
			] );
		}

		// Totals row
		$total_imp = max( $counts['impression'], 1 );
		fputcsv( $output, [
			'TOTAL',
			$counts['impression'],
			$counts['accept'],
			$counts['reject'],
			$counts['personalize'],
			round( ( $counts['accept'] / $total_imp ) * 100, 1 ),
			round( ( $counts['reject'] / $total_imp ) * 100, 1 ),
		] );

		fclose( $output );
		exit;
	}

	/**
	 * Render the admin page.
	 */
	public function render_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		// Get date filters
		$start_date = isset( $_GET['start_date'] ) ? sanitize_text_field( $_GET['start_date'] ) : null;
		$end_date   = isset( $_GET['end_date'] ) ? sanitize_text_field( $_GET['end_date'] ) : null;

		// Validate dates
		if ( $start_date && ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', $start_date ) ) {
			$start_date = null;
		}
		if ( $end_date && ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', $end_date ) ) {
			$end_date = null;
		}

		// Get data
		$counts = Cookie_Analytics_DB::get_event_counts( $start_date, $end_date );
		$daily  = Cookie_Analytics_DB::get_daily_counts( $start_date, $end_date );

		// Calculate rates
		$total_impressions = max( $counts['impression'], 1 ); // Avoid division by zero
		$acceptance_rate   = round( ( $counts['accept'] / $total_impressions ) * 100, 1 );
		$rejection_rate    = round( ( $counts['reject'] / $total_impressions ) * 100, 1 );

		// Prepare chart data
		$chart_labels = array_keys( $daily );
		$chart_data   = [
			'impression'  => [],
			'accept'      => [],
			'reject'      => [],
			'personalize' => [],
		];
		foreach ( $daily as $date => $day_counts ) {
			$chart_data['impression'][]  = $day_counts['impression'];
			$chart_data['accept'][]      = $day_counts['accept'];
			$chart_data['reject'][]      = $day_counts['reject'];
			$chart_data['personalize'][] = $day_counts['personalize'];
		}

		// Get blacklist
		$blacklist = Cookie_Analytics_DB::get_blacklist();

		// Date range label
		$date_label = __( 'All time', 'cookie-analytics' );
		if ( $start_date && $end_date ) {
			$date_label = sprintf( '%s &ndash; %s', esc_html( $start_date ), esc_html( $end_date ) );
		} elseif ( $start_date ) {
			$date_label = sprintf( __( 'From %s', 'cookie-analytics' ), esc_html( $start_date ) );
		} elseif ( $end_date ) {
			$date_label = sprintf( __( 'Until %s', 'cookie-analytics' ), esc_html( $end_date ) );
		}

		?>
		<div class="wrap cookie-analytics-wrap">
			<h1><?php esc_html_e( 'Cookie Analytics', 'cookie-analytics' ); ?></h1>

			<?php settings_errors( 'cookie-analytics' ); ?>

			<!-- Date Range Filter -->
			<div class="cookie-analytics-card">
				<h2><?php esc_html_e( 'Date Range', 'cookie-analytics' ); ?></h2>
				<form method="get" class="cookie-analytics-date-filter">
					<input type="hidden" name="page" value="cookie-analytics" />
					<label for="start_date"><?php esc_html_e( 'From:', 'cookie-analytics' ); ?></label>
					<input type="date" id="start_date" name="start_date" value="<?php echo esc_attr( $start_date ?? '' ); ?>" />

					<label for="end_date"><?php esc_html_e( 'To:', 'cookie-analytics' ); ?></label>
					<input type="date" id="end_date" name="end_date" value="<?php echo esc_attr( $end_date ?? '' ); ?>" />

					<button type="submit" class="button button-primary"><?php esc_html_e( 'Filter', 'cookie-analytics' ); ?></button>
					<a href="<?php echo esc_url( admin_url( 'admin.php?page=cookie-analytics' ) ); ?>" class="button"><?php esc_html_e( 'Reset', 'cookie-analytics' ); ?></a>
					<?php
					$export_url = wp_nonce_url(
						add_query_arg(
							array_filter( [
								'page'       => 'cookie-analytics',
								'action'     => 'export_csv',
								'start_date' => $start_date,
								'end_date'   => $end_date,
							] ),
							admin_url( 'admin.php' )
						),
						'cookie_analytics_export_csv'
					);
					?>
					<a href="<?php echo esc_url( $export_url ); ?>" class="button cookie-analytics-export-button">
						<span class="dashicons dashicons-download" style="vertical-align: middle; margin-right: 2px;"></span>
						<?php esc_html_e( 'Export CSV', 'cookie-analytics' ); ?>
					</a>
				</form>
				<p class="cookie-analytics-date-label">
					<?php
					/* translators: %s: date range label */
					printf( esc_html__( 'Showing data for: %s', 'cookie-analytics' ), '<strong>' . $date_label . '</strong>' );
					?>
				</p>
			</div>

			<!-- Chart -->
			<div class="cookie-analytics-card">
				<h2><?php esc_html_e( 'Events Over Time', 'cookie-analytics' ); ?></h2>
				<?php if ( empty( $daily ) ) : ?>
					<p class="cookie-analytics-empty"><?php esc_html_e( 'No data available for the selected period.', 'cookie-analytics' ); ?></p>
				<?php else : ?>
					<div class="cookie-analytics-chart-container">
						<canvas id="cookieAnalyticsChart"></canvas>
					</div>
				<?php endif; ?>
			</div>

			<!-- Stats Table -->
			<div class="cookie-analytics-card">
				<h2><?php esc_html_e( 'Statistics', 'cookie-analytics' ); ?></h2>
				<table class="widefat cookie-analytics-table">
					<thead>
						<tr>
							<th><?php esc_html_e( 'Event Type', 'cookie-analytics' ); ?></th>
							<th><?php esc_html_e( 'Count', 'cookie-analytics' ); ?></th>
							<th><?php esc_html_e( 'Rate (vs Impressions)', 'cookie-analytics' ); ?></th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td><span class="cookie-analytics-dot dot-impression"></span> <?php esc_html_e( 'Impressions', 'cookie-analytics' ); ?></td>
							<td><strong><?php echo esc_html( number_format_i18n( $counts['impression'] ) ); ?></strong></td>
							<td>&mdash;</td>
						</tr>
						<tr>
							<td><span class="cookie-analytics-dot dot-accept"></span> <?php esc_html_e( 'Accepts', 'cookie-analytics' ); ?></td>
							<td><strong><?php echo esc_html( number_format_i18n( $counts['accept'] ) ); ?></strong></td>
							<td>
								<span class="cookie-analytics-rate rate-accept"><?php echo esc_html( $acceptance_rate ); ?>%</span>
							</td>
						</tr>
						<tr>
							<td><span class="cookie-analytics-dot dot-reject"></span> <?php esc_html_e( 'Rejects', 'cookie-analytics' ); ?></td>
							<td><strong><?php echo esc_html( number_format_i18n( $counts['reject'] ) ); ?></strong></td>
							<td>
								<span class="cookie-analytics-rate rate-reject"><?php echo esc_html( $rejection_rate ); ?>%</span>
							</td>
						</tr>
						<tr>
							<td><span class="cookie-analytics-dot dot-personalize"></span> <?php esc_html_e( 'Personalize', 'cookie-analytics' ); ?></td>
							<td><strong><?php echo esc_html( number_format_i18n( $counts['personalize'] ) ); ?></strong></td>
							<td>
								<span class="cookie-analytics-rate"><?php echo esc_html( round( ( $counts['personalize'] / $total_impressions ) * 100, 1 ) ); ?>%</span>
							</td>
						</tr>
					</tbody>
					<tfoot>
						<tr>
							<td colspan="3">
								<strong><?php esc_html_e( 'Acceptance Rate:', 'cookie-analytics' ); ?></strong> <?php echo esc_html( $acceptance_rate ); ?>%
								&nbsp;&nbsp;|&nbsp;&nbsp;
								<strong><?php esc_html_e( 'Rejection Rate:', 'cookie-analytics' ); ?></strong> <?php echo esc_html( $rejection_rate ); ?>%
							</td>
						</tr>
					</tfoot>
				</table>
			</div>

			<!-- IP Blacklist -->
			<div class="cookie-analytics-card">
				<h2><?php esc_html_e( 'IP Blacklist', 'cookie-analytics' ); ?></h2>
				<p class="description"><?php esc_html_e( 'Events from blacklisted IP addresses will not be recorded. Use this to exclude your own traffic or known bots.', 'cookie-analytics' ); ?></p>

				<form method="post" class="cookie-analytics-blacklist-form">
					<?php wp_nonce_field( 'cookie_analytics_blacklist', '_wpnonce_blacklist' ); ?>
					<input type="text" name="blacklist_ip" placeholder="<?php esc_attr_e( 'e.g. 192.168.1.1', 'cookie-analytics' ); ?>" required />
					<button type="submit" name="cookie_analytics_add_ip" class="button button-primary"><?php esc_html_e( 'Add IP', 'cookie-analytics' ); ?></button>
				</form>

				<?php if ( ! empty( $blacklist ) ) : ?>
					<table class="widefat cookie-analytics-table" style="margin-top: 15px;">
						<thead>
							<tr>
								<th><?php esc_html_e( 'IP Address', 'cookie-analytics' ); ?></th>
								<th><?php esc_html_e( 'Added On', 'cookie-analytics' ); ?></th>
								<th><?php esc_html_e( 'Actions', 'cookie-analytics' ); ?></th>
							</tr>
						</thead>
						<tbody>
							<?php foreach ( $blacklist as $entry ) : ?>
								<tr>
									<td><code><?php echo esc_html( $entry['ip_address'] ); ?></code></td>
									<td><?php echo esc_html( $entry['created_at'] ); ?></td>
									<td>
										<a
											href="<?php echo esc_url( wp_nonce_url(
												admin_url( 'admin.php?page=cookie-analytics&action=remove_ip&id=' . $entry['id'] ),
												'remove_ip_' . $entry['id']
											) ); ?>"
											class="button button-small button-link-delete"
											onclick="return confirm('<?php esc_attr_e( 'Remove this IP from the blacklist?', 'cookie-analytics' ); ?>');"
										>
											<?php esc_html_e( 'Remove', 'cookie-analytics' ); ?>
										</a>
									</td>
								</tr>
							<?php endforeach; ?>
						</tbody>
					</table>
				<?php else : ?>
					<p class="cookie-analytics-empty" style="margin-top: 15px;"><?php esc_html_e( 'No IPs in the blacklist.', 'cookie-analytics' ); ?></p>
				<?php endif; ?>
			</div>

			<!-- Danger Zone -->
			<div class="cookie-analytics-card cookie-analytics-danger-zone">
				<h2><?php esc_html_e( 'Danger Zone', 'cookie-analytics' ); ?></h2>

				<!-- Retention Setting -->
				<div class="cookie-analytics-danger-section">
					<h3><?php esc_html_e( 'Data Retention', 'cookie-analytics' ); ?></h3>
					<p class="description"><?php esc_html_e( 'Automatically delete event data older than the specified period. A daily cleanup runs in the background.', 'cookie-analytics' ); ?></p>

					<?php $retention_days = Cookie_Analytics_DB::get_retention_days(); ?>
					<form method="post" class="cookie-analytics-retention-form">
						<?php wp_nonce_field( 'cookie_analytics_retention', '_wpnonce_retention' ); ?>
						<label for="retention_days"><?php esc_html_e( 'Keep data for:', 'cookie-analytics' ); ?></label>
						<select id="retention_days" name="retention_days">
							<option value="0" <?php selected( $retention_days, 0 ); ?>><?php esc_html_e( 'Forever (no auto-delete)', 'cookie-analytics' ); ?></option>
							<option value="30" <?php selected( $retention_days, 30 ); ?>><?php esc_html_e( '30 days', 'cookie-analytics' ); ?></option>
							<option value="60" <?php selected( $retention_days, 60 ); ?>><?php esc_html_e( '60 days', 'cookie-analytics' ); ?></option>
							<option value="90" <?php selected( $retention_days, 90 ); ?>><?php esc_html_e( '90 days', 'cookie-analytics' ); ?></option>
							<option value="180" <?php selected( $retention_days, 180 ); ?>><?php esc_html_e( '6 months', 'cookie-analytics' ); ?></option>
							<option value="365" <?php selected( $retention_days, 365 ); ?>><?php esc_html_e( '1 year', 'cookie-analytics' ); ?></option>
						</select>
						<button type="submit" name="cookie_analytics_save_retention" class="button"><?php esc_html_e( 'Save', 'cookie-analytics' ); ?></button>
					</form>
				</div>

				<hr class="cookie-analytics-danger-divider" />

				<!-- Delete All Data -->
				<div class="cookie-analytics-danger-section">
					<h3><?php esc_html_e( 'Delete All Data', 'cookie-analytics' ); ?></h3>
					<p class="description"><?php esc_html_e( 'Permanently delete all cookie analytics event data. This action cannot be undone.', 'cookie-analytics' ); ?></p>

					<form method="post" class="cookie-analytics-danger-form">
						<?php wp_nonce_field( 'cookie_analytics_danger_zone', '_wpnonce_danger_zone' ); ?>
						<label for="confirm_delete">
							<?php esc_html_e( 'Type DELETE to confirm:', 'cookie-analytics' ); ?>
						</label>
						<input type="text" id="confirm_delete" name="confirm_delete" placeholder="DELETE" autocomplete="off" required />
						<button type="submit" name="cookie_analytics_delete_all" class="button cookie-analytics-delete-button" onclick="return confirm('<?php esc_attr_e( 'Are you sure? All analytics data will be permanently deleted.', 'cookie-analytics' ); ?>');">
							<?php esc_html_e( 'Delete All Data', 'cookie-analytics' ); ?>
						</button>
					</form>
				</div>
			</div>
		</div>

		<script>
			window.cookieAnalyticsData = {
				labels: <?php echo wp_json_encode( $chart_labels ); ?>,
				impressions: <?php echo wp_json_encode( $chart_data['impression'] ); ?>,
				accepts: <?php echo wp_json_encode( $chart_data['accept'] ); ?>,
				rejects: <?php echo wp_json_encode( $chart_data['reject'] ); ?>,
				personalizes: <?php echo wp_json_encode( $chart_data['personalize'] ); ?>,
			};
		</script>
		<?php
	}
}
