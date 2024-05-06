<?php

namespace SUPT\SettingsFields;

function render_switch_field($args) {
	// TODO: This is not really pretty 😬
	echo '<style>.switch{position:relative;display:flex;font-size:14px}.switch__chk{position:absolute;z-index:-1;opacity:0}.switch__label{position:relative;z-index:1;height:20px;width:38px;order:2;cursor:pointer;border-radius:34px;font-size:0;box-shadow:none;background-color:#858585;transition:background-color 0.2s ease-out, box-shadow 0.2s ease-out}.switch__label::before{content:"";position:absolute;top:calc(50% - 8px);left:2px;display:block;height:12px;width:12px;border-radius:50%;background-color:transparent;border:2px solid #ffffff;transition:background-color 0.2s ease-out, transform 0.2s ease-out}.switch__chk:checked+label{background-color:#00A54B}.switch__chk:checked+label::before{transform:translateX(18px);background-color:#ffffff}.switch__chk:focus+label{box-shadow:inset #007cba 0px 0px 1px 1px, #007cba 0px 0px 1px 1px}</style>';
	printf(

		'<div class="switch"><input class="switch__chk" type="checkbox" id="%1$s" name="%2$s" %3$s><label for="%1$s" class="switch__label" tabindex="-1"></label></div>%4$s',
		$args['id'] ?? $args['name'],
		$args['name'],
		($args['checked']  ? 'checked' : ''),
		empty($args['help']) ?: sprintf('<p class="description">%s</p>', $args['help'])
	);
}

function render_field_text($args) {
	$tple = ( (isset($args['type']) && $args['type'] === 'textarea' )
		? '<textarea id="%1$s" name="%2$s" placeholder="%3$s" style="min-width:400px;min-height: 100px;">%4$s</textarea>'
		: sprintf('<input type="%s" id="%%1$s" name="%%2$s" placeholder="%%3$s" value="%%4$s" />%%5$s', $args['type'] ?? 'text')
	);

	printf( $tple,
		$args['id'] ?? $args['name'],
		$args['name'],
		$args['placeholder'] ?? '',
		$args['value'] ?? '',
		( empty($args['help'])
			? ''
			: sprintf('<p class="description">%s</p>', $args['help'])
		)
	);
}
