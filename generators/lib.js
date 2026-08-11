/**
 * Shared plumbing for the generators in this directory.
 *
 * Nothing here is generator-specific — the repository root every generator
 * resolves paths against, the ✔/⚠ reporting both use, the readline lifecycle
 * their interactive prompts share, and the top-level error handling.
 */

const path = require('path');
const readline = require('readline/promises');

const rootDir = path.resolve(__dirname, '..');

const log = (message) => console.log(`✔ ${message}`);
const warn = (message) => console.warn(`⚠ ${message}`);

/**
 * Run `callback` with a readline interface, closing it whatever happens.
 */
async function withPrompt(callback) {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	try {
		return await callback(rl);
	} finally {
		rl.close();
	}
}

/**
 * Entry point wrapper: report the error and exit non-zero rather than
 * printing an unhandled rejection.
 */
function run(main) {
	main().catch((error) => {
		console.error(error);
		process.exit(1);
	});
}

module.exports = { rootDir, log, warn, withPrompt, run };
