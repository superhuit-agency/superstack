#!/usr/bin/env node

/**
 * Migrate the stack between single language and multilanguage setup.
 *
 * Interactive:
 *   npm run generate:language-migration
 *
 * Non-interactive:
 *   node generators/lang-migration.js to-multilang fr en de
 *   node generators/lang-migration.js to-singlelang fr
 *
 * (first locale = default locale, following locales = additional locales)
 *
 * Most of the code branches at runtime on `configs.isMultilang`
 * (GraphQL fragments, get-all-uris, get-node-by-uri, proxy, get-locales…),
 * so this script only handles the structural changes:
 * - move `[[...uri]]` in/out of the `[lang]` route segment
 * - add/remove `[lang]/layout.tsx` and swap the root layout
 * - update `configs.json`, `proxy.ts`, `typings.d.ts`, `locale-context.tsx`
 * - toggle the `IS_MULTILANG` default in `wordpress/scripts/provision.sh`
 *
 * The multilang WP plugins (polylang, wp-graphql-polylang, …) stay in
 * `composer.json` in both modes — provision.sh activates/deactivates them
 * based on `IS_MULTILANG`, so no composer step is needed here.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { rootDir, log, warn, withPrompt, run } = require('./lib');

const templatesDir = path.join(__dirname, 'templates', 'lang-migration');

const paths = {
	appDir: path.join(rootDir, 'next/src/app'),
	uriDir: path.join(rootDir, 'next/src/app/[[...uri]]'),
	langDir: path.join(rootDir, 'next/src/app/[lang]'),
	langUriDir: path.join(rootDir, 'next/src/app/[lang]/[[...uri]]'),
	rootLayout: path.join(rootDir, 'next/src/app/layout.tsx'),
	langLayout: path.join(rootDir, 'next/src/app/[lang]/layout.tsx'),
	configsJson: path.join(rootDir, 'next/src/configs.json'),
	proxy: path.join(rootDir, 'next/src/proxy.ts'),
	typings: path.join(rootDir, 'next/src/i18n/typings.d.ts'),
	dictionariesDir: path.join(rootDir, 'next/src/i18n/dictionaries'),
	localeContext: path.join(rootDir, 'next/src/contexts/locale-context.tsx'),
	provisionSh: path.join(rootDir, 'wordpress/scripts/provision.sh'),
};

const isValidLocale = (value) => /^[a-z]{2}(-[a-z]{2})?$/.test(value);

async function prompt() {
	const [, , typeArg, ...localeArgs] = process.argv;

	if (typeArg) {
		if (!['to-multilang', 'to-singlelang'].includes(typeArg)) {
			console.error(
				`Unknown migration type "${typeArg}". Use "to-multilang" or "to-singlelang".`
			);
			process.exit(1);
		}

		const locales = localeArgs.map((l) => l.toLowerCase());
		const invalid = locales.filter((l) => !isValidLocale(l));
		if (locales.length === 0 || invalid.length > 0) {
			console.error(
				invalid.length > 0
					? `Invalid locale(s): ${invalid.join(', ')}`
					: 'At least a default locale is required (e.g. "node generators/lang-migration.js to-multilang fr en").'
			);
			process.exit(1);
		}

		return {
			migrationType:
				typeArg === 'to-multilang' ? 'toMultilang' : 'toSinglelang',
			defaultLocale: locales[0],
			additionalLocales: typeArg === 'to-multilang' ? locales.slice(1) : [],
		};
	}

	return withPrompt(async (rl) => {
		let migrationType;
		while (!migrationType) {
			const answer = (
				await rl.question(
					'Select migration type:\n  1) Single language to multilanguage\n  2) Multilanguage to single language\n> '
				)
			).trim();

			if (answer === '1') migrationType = 'toMultilang';
			else if (answer === '2') migrationType = 'toSinglelang';
			else console.log('Please answer 1 or 2.');
		}

		const currentStaticLang =
			readConfigs()?.staticLang ?? 'fr';

		let defaultLocale;
		while (!defaultLocale) {
			const answer =
				(
					await rl.question(
						`Enter the default locale (e.g. en) [${currentStaticLang}]: `
					)
				)
					.trim()
					.toLowerCase() || currentStaticLang;

			if (isValidLocale(answer)) defaultLocale = answer;
			else console.log('Invalid locale, expected e.g. "en" or "fr-ch".');
		}

		let additionalLocales = [];
		if (migrationType === 'toMultilang') {
			const answer = (
				await rl.question(
					'Enter additional locales (space separated, leave empty if none): '
				)
			)
				.trim()
				.toLowerCase();

			additionalLocales = answer.split(/\s+/).filter(Boolean);

			const invalid = additionalLocales.filter((l) => !isValidLocale(l));
			if (invalid.length > 0) {
				console.error(`Invalid locale(s): ${invalid.join(', ')}`);
				process.exit(1);
			}
		}

		return { migrationType, defaultLocale, additionalLocales };
	});
}

function readConfigs() {
	if (!fs.existsSync(paths.configsJson)) return null;
	return JSON.parse(fs.readFileSync(paths.configsJson, 'utf8'));
}

function updateConfigs(isMultilang, defaultLocale) {
	const configs = readConfigs();
	if (!configs) {
		warn('configs.json not found, skipping update');
		return;
	}

	configs.isMultilang = isMultilang;
	configs.staticLang = defaultLocale;
	fs.writeFileSync(
		paths.configsJson,
		JSON.stringify(configs, null, '\t') + '\n'
	);
	log(
		`Updated configs.json (isMultilang: ${isMultilang}, staticLang: "${defaultLocale}")`
	);
}

function copyTemplate(templateName, destination) {
	fs.copyFileSync(path.join(templatesDir, templateName), destination);
	log(`Wrote ${path.relative(rootDir, destination)}`);
}

function replaceInFile(filePath, pattern, replacement, description) {
	if (!fs.existsSync(filePath)) {
		warn(`${path.relative(rootDir, filePath)} not found, skipping update`);
		return;
	}

	const content = fs.readFileSync(filePath, 'utf8');
	if (!pattern.test(content)) {
		warn(
			`Pattern for "${description}" not found in ${path.relative(rootDir, filePath)}, skipping update`
		);
		return;
	}

	fs.writeFileSync(filePath, content.replace(pattern, replacement));
	log(description);
}

function updateProxyLocales(locales) {
	replaceInFile(
		paths.proxy,
		/const locales = \[[^\]]*\];/,
		`const locales = [${locales.map((l) => `'${l}'`).join(', ')}];`,
		`Updated proxy.ts locales to [${locales.join(', ')}]`
	);
}

function updateLocaleTypings(locales) {
	replaceInFile(
		paths.typings,
		/type Locale = [^;]+;/,
		`type Locale = ${locales.map((l) => `'${l}'`).join(' | ')};`,
		`Updated typings.d.ts Locale type to ${locales.join(' | ')}`
	);
}

function updateLocaleContextDefaults(defaultLocale) {
	replaceInFile(
		paths.localeContext,
		/from '@\/i18n\/dictionaries\/[\w-]+\.json'/,
		`from '@/i18n/dictionaries/${defaultLocale}.json'`,
		`Updated locale-context.tsx default dictionary to "${defaultLocale}"`
	);
	replaceInFile(
		paths.localeContext,
		/(createContext<LocaleContextType>\(\{\s*locale: ')[\w-]+(')/,
		`$1${defaultLocale}$2`,
		`Updated locale-context.tsx default locale to "${defaultLocale}"`
	);
}

function ensureDictionaries(locales) {
	for (const locale of locales) {
		const dictionaryPath = path.join(
			paths.dictionariesDir,
			`${locale}.json`
		);
		if (fs.existsSync(dictionaryPath)) continue;

		fs.writeFileSync(dictionaryPath, '{}\n');
		log(`Created ${path.relative(rootDir, dictionaryPath)}`);
	}
}

function updateProvision(isMultilang) {
	replaceInFile(
		paths.provisionSh,
		/IS_MULTILANG=\$\{IS_MULTILANG:=(true|false)\}/,
		`IS_MULTILANG=\${IS_MULTILANG:=${isMultilang}}`,
		`Updated provision.sh IS_MULTILANG default to ${isMultilang}`
	);
}

function moveDir(from, to, description) {
	if (!fs.existsSync(from)) {
		warn(
			`${path.relative(rootDir, from)} not found, skipping move operation`
		);
		return;
	}

	fs.renameSync(from, to);
	log(description);
}

function formatFiles() {
	try {
		execSync(
			'npx prettier --write "next/src/app/**/*.tsx" "next/src/proxy.ts" "next/src/i18n/**/*.{ts,json}" "next/src/contexts/locale-context.tsx" "next/src/configs.json" --log-level=silent',
			{ cwd: rootDir, stdio: 'inherit' }
		);
		log('Formatted files with prettier');
	} catch {
		warn('Prettier formatting failed, format manually with "npm run format"');
	}
}

function toMultilang(defaultLocale, additionalLocales) {
	const locales = [defaultLocale, ...additionalLocales];

	if (!fs.existsSync(paths.langDir)) {
		fs.mkdirSync(paths.langDir, { recursive: true });
		log('Created [lang] directory');
	}

	copyTemplate('lang-layout.tsx', paths.langLayout);
	moveDir(
		paths.uriDir,
		paths.langUriDir,
		'Moved [[...uri]] into [lang] folder'
	);
	copyTemplate('root-layout-multilang.tsx', paths.rootLayout);

	updateConfigs(true, defaultLocale);
	updateProxyLocales(locales);
	updateLocaleTypings(locales);
	updateLocaleContextDefaults(defaultLocale);
	ensureDictionaries(locales);
	updateProvision(true);
	formatFiles();

	console.log(`
Next steps:
  1. Restart WordPress (cd wordpress && npm run start) so provision.sh
     activates the multilang plugins (polylang, wp-graphql-polylang, …).
  2. Configure the languages in WP Admin → Languages (Polylang):
     ${locales.join(', ')}
  3. Fill in the UI strings in next/src/i18n/dictionaries/{locale}.json.
`);
}

function toSinglelang(defaultLocale) {
	moveDir(
		paths.langUriDir,
		paths.uriDir,
		'Moved [[...uri]] out of [lang] folder'
	);

	if (fs.existsSync(paths.langDir)) {
		fs.rmSync(paths.langDir, { recursive: true });
		log('Removed [lang] folder');
	} else {
		warn('[lang] folder not found, skipping removal');
	}

	copyTemplate('root-layout-singlelang.tsx', paths.rootLayout);

	updateConfigs(false, defaultLocale);
	updateProxyLocales([defaultLocale]);
	updateLocaleTypings([defaultLocale]);
	updateLocaleContextDefaults(defaultLocale);
	ensureDictionaries([defaultLocale]);
	updateProvision(false);
	formatFiles();

	console.log(`
Next steps:
  1. Restart WordPress (cd wordpress && npm run start) so provision.sh
     deactivates the multilang plugins.
  2. Unused dictionaries in next/src/i18n/dictionaries/ can be deleted
     (keep ${defaultLocale}.json).
`);
}

async function main() {
	const { migrationType, defaultLocale, additionalLocales } = await prompt();
	const configs = readConfigs();

	if (configs?.isMultilang && migrationType === 'toMultilang') {
		warn('configs.json already has isMultilang: true — re-applying anyway');
	}
	if (configs && !configs.isMultilang && migrationType === 'toSinglelang') {
		warn(
			'configs.json already has isMultilang: false — re-applying anyway'
		);
	}

	if (migrationType === 'toMultilang') {
		toMultilang(defaultLocale, additionalLocales);
	} else {
		toSinglelang(defaultLocale);
	}
}

run(main);
