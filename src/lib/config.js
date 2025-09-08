/**
 * ℹ️ Keep this as a .js file because it is used by
 *    `src/utils/node-utils.js` which is run by node without typescript support
 */

const configs = require('../configs.json');

/**
 * Get multisite configuration from environment variables
 * Falls back to configs.json for development
 */
function getMultisiteConfig() {
	// Check if we have environment variables for multisite config
	const multisiteEnv = process.env.MULTISITE_CONFIG;

	if (multisiteEnv) {
		try {
			return JSON.parse(multisiteEnv);
		} catch (error) {
			console.warn(
				'Failed to parse MULTISITE_CONFIG environment variable, falling back to configs.json'
			);
		}
	}

	return [];
}

/**
 * Get application configuration with environment-dependent multisite settings
 */
function getAppConfigs() {
	return {
		...configs,
		multisite: getMultisiteConfig(),
	};
}

module.exports = {
	getAppConfigs,
};
