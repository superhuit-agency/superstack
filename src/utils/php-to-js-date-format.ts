/**
 * Basic conversion of a PHP date format string
 * to a JS date localeDateStrint option object.
 * @see https://www.php.net/manual/en/datetime.format.php#refsect1-datetime.format-parameters
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#parameters
 *
 * @param {string} phpFormat PHP string date format
 * @returns {Object} the JS option object
 */
export function phpToJsDateFormat(phpFormat: string) {
	const jsFormat: {
		day?: '2-digit' | 'numeric';
		weekday?: 'short' | 'long';
		month?: 'long' | '2-digit' | 'short' | 'numeric';
		year?: 'numeric' | '2-digit';
	} = {};

	if (phpFormat.includes('d')) jsFormat.day = '2-digit';
	if (phpFormat.includes('j')) jsFormat.day = 'numeric';

	if (phpFormat.includes('D')) jsFormat.weekday = 'short';
	if (phpFormat.includes('l')) jsFormat.weekday = 'long';

	if (phpFormat.includes('F')) jsFormat.month = 'long';
	if (phpFormat.includes('m')) jsFormat.month = '2-digit';
	if (phpFormat.includes('M')) jsFormat.month = 'short';
	if (phpFormat.includes('n')) jsFormat.month = 'numeric';

	if (phpFormat.includes('Y')) jsFormat.year = 'numeric';
	if (phpFormat.includes('y')) jsFormat.year = '2-digit';

	return jsFormat;
}
