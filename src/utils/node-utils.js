// const configs = require('../configs.json');
// const fetch = require('node-fetch');

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

// // const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

// const getWpRestUrl = () => {
// 	return `${getEnvironmentConfig().wordpress.url}/wp-json`;
// };

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

// const getWpLocales = async () => {
// 	if (!configs.isMultilang) return null; // Return early if it's not multilang

// 	const GRAPHQL_URL = getWpGraphqlUrl();

// 	const headers = { 'Content-Type': 'application/json' };

// 	try {
// 		const res = await fetch(GRAPHQL_URL, {
// 			method: 'POST',
// 			headers,
// 			body: JSON.stringify({
// 				query: `query locales {
// 					languages {
// 						slug
// 						locale
// 					}
// 					defaultLanguage {
// 						slug
// 					}
// 				}
// 			`,
// 			}),
// 		});

// 		const { data, errors } = await res.json();
// 		if (errors) throw new Error('Failed to fetch API');

// 		return data;
// 	} catch (error) {
// 		console.error(error);
// 	}
// };

module.exports = {
	getWpUrl,
	// getWpRestUrl,
	getWpGraphqlUrl,
	getWpDomain,
	getWpFormsSecret,
	// getWpLocales,
};
