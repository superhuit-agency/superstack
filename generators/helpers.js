const join = function (array, key, separator) {
	if (typeof array === 'string') return array;
	if (!Array.isArray(array)) return '';
	separator = typeof separator === 'string' ? separator : ',';

	if (key) {
		return array.map((item) => item[key]).join(separator);
	} else {
		return array.join(separator);
	}
};

const equals = function () {
	const args = Array.prototype.slice.call(arguments, 0, -1);
	return args.every(function (expression) {
		return args[0] === expression;
	});
};

const ensurePlural = (text) => text.trimEnd('s') + 's';

const ifAndCond = function (v1, v2, options) {
	if (v1 && v2) {
		return options.fn(this);
	}
	return options.inverse(this);
};

const ifOrCond = function (v1, v2, options) {
	if (v1 || v2) {
		return options.fn(this);
	}
	return options.inverse(this);
};

const ifNot = function (v1, options) {
	if (!v1) {
		return options.fn(this);
	}
	return options.inverse(this);
};

const hasLength = function (array) {
	return !!array.length;
};

exports.join = join;
exports.equals = equals;
exports.ensurePlural = ensurePlural;
exports.ifAndCond = ifAndCond;
exports.ifOrCond = ifOrCond;
exports.ifNot = ifNot;
exports.hasLength = hasLength;
