<?php

namespace SUPT;

function get_rewrite_query($permastruct, $data) {
	$tags = array_keys($data);
	$query_params = array_reduce($tags, function($carry, $tag) use ($permastruct, $data) {
		if ( strpos($permastruct, $tag) !== false ) $carry[] = sprintf('%s=$matches[%d]', str_replace('%', '', $tag), $data[$tag]['matchIndex']);
		return $carry;
	});

	return 'index.php?'. implode('&', $query_params );
}
