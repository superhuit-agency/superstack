const { getAppConfigs } = require('../lib/config.js');

/**
 * Get the current environment
 * Useful for preview deployments, to connect with a given WordPress endpoint for example.
 * The order is important here, we will return the first existing non-falsy value from:
 * - environment variables (WORDPRESS_URL,…)
 * - a hardcoded fallback for local development (localhost)
 *
 * @returns {Object}
 */
const getEnvironmentConfig = (region) => {
	let url = process.env.WORDPRESS_URL ?? 'http://localhost';

	if (region) {
		const configs = getAppConfigs();
		if (configs.multisite) {
			const site = configs.multisite.find(
				(site) => site.region === region
			);
			if (site?.wpUrl) {
				url = site.wpUrl;
			}
		}
	}

	return {
		wordpress: {
			url,
			forms_secret: process.env.WORDPRESS_FORMS_SECRET ?? 'spck',
		},
	};
};

const getWpGraphqlUrl = (region) => {
	return `${getEnvironmentConfig(region).wordpress.url}/graphql`;
};

const getWpUrl = () => {
	return getEnvironmentConfig().wordpress.url;
};

const getWpFormsSecret = () => {
	return getEnvironmentConfig().wordpress.forms_secret;
};

const getWpDomain = () => {
	const url = getWpUrl();
	return url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];
};

module.exports = {
	getWpUrl,
	getWpGraphqlUrl,
	getWpDomain,
	getWpFormsSecret,
};
