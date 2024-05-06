/**
 *
 * Render a fluid sizing using clamp for any property
 *
 * @param {String} $property - Property to act on
 * @param {Number} $min-px - Minimum size in px
 * @param {Number} $max-px - Maximum size in px
 * @param {String} $min-bp - Minimum breakpoint in PX
 * @param {String} $max-bp - Maximum breakpoint in PX
 * @returns {Object} - Object with the property and value
 *
 * @example
 * // postcss
 * @mixin clamp width, 24, 32, 600px, 900px;
 * // css
 * width: clamp(1.5rem, 2.5vw + 0.5rem, 2rem);
 *
 */
module.exports = {
	clamp(mixin, property, minPx, maxPx, minBp, maxBp) {
		const toRems = (px) => {
			return px / 16;
		};
		const rnd = (number, places = 0) => {
			let n = 1;
			if (places > 0) {
				for (let i = 1; i <= places; i++) {
					n = n * 10;
				}
			}
			return Math.round(number * n) / n;
		};

		// Remove px from breakpoints
		const strippedMinBp = minBp.replace(/px/g, '');
		const strippedMaxBp = maxBp.replace(/px/g, '');

		const slope = (maxPx - minPx) / (strippedMaxBp - strippedMinBp);
		const slopeVw = rnd(slope * 100, 2);
		const interceptRems = rnd(toRems(minPx - slope * strippedMinBp), 2);

		return {
			[property]: `clamp(${minPx}px, ${slopeVw}vw + ${interceptRems}rem, ${maxPx}px)`,
		};
	},
};
