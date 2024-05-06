<?php

namespace SUPT;

function get_next_url() {
	if (!empty($_ENV['NEXT_URL'])) {
		return $_ENV['NEXT_URL'];
	}

	if (!empty(get_option('next_url'))) {
		return get_option('next_url');
	}

	return 'http://localhost:3000';
}
