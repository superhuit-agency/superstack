<?php

namespace Superstack\Public;

use Superstack\Traits\Singleton;

if (! defined('ABSPATH')) {
	exit;
}

/**
 * Force native browser controls for Forminator forms.
 *
 * Disables Select2 widget and jQuery UI Datepicker so the browser's
 * built-in <select> and <input type="date"> are used instead.
 * JS libraries are kept loaded to avoid crashing Forminator's
 * material-design initialisation (floating labels, etc.).
 *
 * @package    Superstack
 * @subpackage Superstack/Public
 * @since      1.0.0
 */
class Disable_Forminator_Select2 {
	use Singleton;

	/**
	 * Initialize the class.
	 *
	 * @access public
	 * @return void
	 */
	public function init() {
		add_action('wp_enqueue_scripts', [$this, 'dequeue_styles'], 9999);
		add_action('wp_footer', [$this, 'restore_native_controls']);
	}

	/**
	 * Dequeue Select2 and datepicker styles loaded by Forminator.
	 * JS is kept so that FUIselect2 init doesn't crash and the
	 * material-design floating-label behaviour still works.
	 *
	 * @access public
	 * @return void
	 */
	public function dequeue_styles() {
		$style_handles = [
			'forminator-select2-css',
			'forminator-forms-material-select2-css',
			'select2',
			'selectWoo',
		];

		foreach ($style_handles as $h) {
			wp_dequeue_style($h);
			wp_deregister_style($h);
		}
	}

	/**
	 * Inline script that restores native <select> after Select2
	 * and replaces jQuery UI Datepicker with native date input.
	 *
	 * @access public
	 * @return void
	 */
	public function restore_native_controls() {
?>
		<script>
			(function() {
				document.querySelectorAll('.forminator-ui .forminator-select--field').forEach(function(s) {
					s.removeAttribute('aria-hidden');
					s.removeAttribute('tabindex');
					s.classList.remove('select2-hidden-accessible', 'forminator-screen-reader-only');
				});

				function restoreDatepickers() {
					var nativeFormat = 'yy-mm-dd';

					document.querySelectorAll('.forminator-ui .forminator-datepicker').forEach(function(input) {
						if (typeof jQuery !== 'undefined' && jQuery(input).data('datepicker')) {
							jQuery(input).datepicker('destroy');
						}
						input.type = 'date';
						input.removeAttribute('placeholder');
						input.classList.remove('hasDatepicker');
						input.setAttribute('data-format', nativeFormat);

						var dpWidget = document.getElementById(input.id + '-dp');
						if (dpWidget) dpWidget.remove();

						var field = input.closest('.forminator-field');
						if (field) field.classList.add('forminator-is_filled');

						var $form = jQuery(input).closest('form');
						if ($form.length && $form.data('validator')) {
							var rules = $form.data('validator').settings.rules;
							if (rules[input.name] && rules[input.name].dateformat) {
								rules[input.name].dateformat = nativeFormat;
							}
						}
					});

					document.querySelectorAll('#ui-datepicker-div').forEach(function(el) {
						el.remove();
					});
				}

				if (document.readyState === 'complete') {
					setTimeout(restoreDatepickers, 100);
				} else {
					window.addEventListener('load', function() {
						setTimeout(restoreDatepickers, 100);
					});
				}
			})();
		</script>
<?php
	}
}

Disable_Forminator_Select2::get_instance()->init();
