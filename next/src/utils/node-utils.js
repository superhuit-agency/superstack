/**
 * Get the current environment
 * Useful for preview deployments, to connect with a given WordPress endpoint for example.
 * The order is important here, we will return the first existing non-falsy value from:
 * - environment variables (WORDPRESS_URL,…)
 * - a hardcoded fallback for local development (localhost)
 *
 * @returns {Object}
 */
const getEnvironmentConfig = () => {
	return {
		wordpress: {
			url: process.env.WORDPRESS_URL ?? 'http://localhost',
			forms_secret: process.env.WORDPRESS_FORMS_SECRET ?? 'spck',
		},
	};
};

const getWpGraphqlUrl = () => {
	return `${getEnvironmentConfig().wordpress.url}/graphql`;
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
