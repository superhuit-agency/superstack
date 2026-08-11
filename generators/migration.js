#!/usr/bin/env node

/**
 * Scaffold a database migration for the WordPress theme.
 *
 * Interactive:
 *   npm run generate:migration
 *
 * Non-interactive:
 *   npm run generate:migration "fix section cards"
 *   node generators/migration.js fix section cards
 *
 * Writes wordpress/theme/migrations/<YYYYMMDD_HHMMSS>_<slug>.php from the
 * template in generators/templates/migration/, with the description filled in.
 * The timestamp prefix is what orders migrations, so the file is named at
 * creation time and never renamed afterwards.
 *
 * See wordpress/theme/migrations/README.md for the runner contract and the
 * `wp spck migrate` flags.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline/promises');

const rootDir = path.resolve(__dirname, '..');
const templatesDir = path.join(__dirname, 'templates', 'migration');

const paths = {
	template: path.join(templatesDir, 'migration.php'),
	migrationsDir: path.join(rootDir, 'wordpress/theme/migrations'),
};

const log = (message) => console.log(`✔ ${message}`);
const warn = (message) => console.warn(`⚠ ${message}`);

const slugify = (description) =>
	description
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '_')
		.replace(/^_+|_+$/g, '');

function timestamp() {
	const now = new Date();
	const pad = (value) => String(value).padStart(2, '0');

	return [
		now.getFullYear(),
		pad(now.getMonth() + 1),
		pad(now.getDate()),
		'_',
		pad(now.getHours()),
		pad(now.getMinutes()),
		pad(now.getSeconds()),
	].join('');
}

async function prompt() {
	const description = process.argv.slice(2).join(' ').trim();

	if (description) return description;

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	try {
		let answer;
		while (!answer) {
			answer = (
				await rl.question(
					'Short description of the migration (e.g. "fix section cards"): '
				)
			).trim();

			if (answer && !slugify(answer)) {
				console.log(
					'Please use a description with at least one letter or digit.'
				);
				answer = '';
			}
		}

		return answer;
	} finally {
		rl.close();
	}
}

function writeMigration(description) {
	const slug = slugify(description);
	if (!slug) {
		console.error(
			`Cannot derive a filename from "${description}" — use at least one letter or digit.`
		);
		process.exit(1);
	}

	if (!fs.existsSync(paths.migrationsDir)) {
		warn(
			`${path.relative(rootDir, paths.migrationsDir)} not found, creating it`
		);
		fs.mkdirSync(paths.migrationsDir, { recursive: true });
	}

	const destination = path.join(
		paths.migrationsDir,
		`${timestamp()}_${slug}.php`
	);

	if (fs.existsSync(destination)) {
		console.error(
			`${path.relative(rootDir, destination)} already exists, aborting.`
		);
		process.exit(1);
	}

	const contents = fs
		.readFileSync(paths.template, 'utf8')
		.replace(/\{\{description\}\}/g, description);

	fs.writeFileSync(destination, contents);
	log(`Wrote ${path.relative(rootDir, destination)}`);

	return destination;
}

async function main() {
	const description = await prompt();
	const destination = writeMigration(description);

	console.log(`
Next steps:
  1. Edit ${path.relative(rootDir, destination)}: keep either the array of
     WP-CLI commands or the callable, and complete the docblock.
  2. Preview it with "wp spck migrate --dry-run", then run it against a copy of
     the production database with "wp spck migrate --only=${path.basename(destination)}".
  3. Commit the migration alongside the theme changes that require it.
`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
