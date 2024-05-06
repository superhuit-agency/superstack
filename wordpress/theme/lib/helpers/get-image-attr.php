<?php

namespace SUPT;

/**
 * Retrieve base image attributes
 *  - src
 *  - width
 *  - height
 *  - alt
 *
 * @param int          $id   Image attachment ID.
 * @param string|int[] $size Optional. Image size. Accepts any registered image size name,  or an array of
 *                                     width and height values in pixels (in that order). Default 'full'.
 *
 * @return array|false {
 *     Array of image data, or boolean false if no image is available.
 *
 *     @type string $src    Image source URL.
 *     @type int    $width  Image width in pixels.
 *     @type int    $height Image height in pixels.
 *     @type string $alt    Image alternative text.
 * }
 */
function get_image_attr($id, $size = 'full') {
	$image = wp_get_attachment_image_src( $id, $size );

	if ( !$image ) return false;

	list($src, $width, $height) = $image;

	return array_map( 'esc_attr', [
		'src'    => $src,
		'width'  => $width,
		'height' => $height,
		'alt'    => trim( strip_tags( get_post_meta( $id, '_wp_attachment_image_alt', true ) ) ),
	] );
}
