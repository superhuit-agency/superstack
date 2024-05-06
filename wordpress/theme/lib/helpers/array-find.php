<?php

namespace SUPT;

/**
 * Returns the first element in the provided array that satisfies the provided callback function.
 * If no values satisfy the testing function, null is returned
 *
 * @param Array    $array    The array to run the callback function.
 * @param callable $callback Function to execute on each value in the array.
 *                           The function is called with the following arguments
 *                             - item: The current item in the array
 *                             - key:  The current index in the array
 *                           The callback must return a `true` or `false` value to indicate a matching element has been found
 *
 * @return mixed The first element that satisfies the provided callback function, or null.
 */
function array_find($array, $callback) {
	foreach ($array as $k => $x) {
		if (call_user_func($callback, $x, $k) === true) return $x;
	}
	return null;
}
