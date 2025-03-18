const helpers = require('./helpers');
const { exec } = require('child_process');
const fs = require('fs');

module.exports = async function (plop) {
	// Register helpers
	plop.setHelper('ensurePlural', helpers.ensurePlural);
	plop.setHelper('equals', helpers.equals);
	plop.setHelper('join', helpers.join);
	plop.setHelper('ifAndCond', helpers.ifAndCond);
	plop.setHelper('ifOrCond', helpers.ifOrCond);
	plop.setHelper('ifNot', helpers.ifNot);
	plop.setHelper('hasLength', helpers.hasLength);

	// Load slugify helper
	await plop.load('plop-helper-slugify');

	plop.setGenerator('language-migration', {
		description: 'Migrate between single language and multilanguage setup',
		prompts: [
			{
				type: 'list',
				name: 'migrationType',
				message: 'Select migration type:',
				choices: [
					{
						name: 'Single language to multilanguage',
						value: 'toMultilang',
					},
					{
						name: 'Multilanguage to single language',
						value: 'toSinglelang',
					},
				],
			},
			{
				type: 'input',
				name: 'defaultLocale',
				message: 'Enter the default locale (e.g. en):',
				default: 'en',
				validate: function (value) {
					return !value ? 'Default locale is required' : true;
				},
			},
			{
				type: 'input',
				name: 'additionalLocales',
				message:
					'Enter additional locales (space separated, leave empty if none):',
				filter: (input) =>
					!input ? [] : input.split(' ').filter(Boolean),
				when: (data) => data.migrationType === 'toMultilang',
			},
		],
		actions: function (data) {
			const actions = [];
			const rootAppDir = 'src/app';
			const relativeAppDir = '../src/app';
			const rootUriFolder = `${rootAppDir}/[[...uri]]`;
			const rootLangFolder = `${rootAppDir}/[lang]`;
			const relativeLangFolder = `${relativeAppDir}/[lang]`;
			const rootMultiLangUriFolder = `${rootLangFolder}/[[...uri]]`;
			const rootLayoutPath = `${relativeAppDir}/layout.tsx`;
			const langLayoutPath = `${relativeLangFolder}/layout.tsx`;
			const configsJsonPath = 'src/configs.json';
			const provisionShPath = 'wordpress/scripts/provision.sh';
			const middlewarePath = 'src/middleware.ts';

			if (data.migrationType === 'toMultilang') {
				// Create the [lang] folder if it doesn't exist
				actions.push(function (data) {
					if (!fs.existsSync(relativeLangFolder)) {
						fs.mkdirSync(relativeLangFolder, { recursive: true });
					}
					return `Created ${relativeLangFolder} directory`;
				});

				// Add the layout file to the [lang] folder using the template
				actions.push({
					type: 'add',
					path: langLayoutPath,
					templateFile:
						'./templates/lang-migration/multilang/layout.tsx.hbs',
					force: true,
				});

				// Update the root layout.tsx file using the multilang template
				actions.push({
					type: 'add',
					path: rootLayoutPath,
					templateFile:
						'./templates/lang-migration/root-layout-multilang.tsx.hbs',
					force: true,
				});

				// Custom action to move [[...uri]] into [lang] folder if it exists
				actions.push(function (data) {
					if (fs.existsSync(rootUriFolder)) {
						try {
							// Move the [[...uri]] folder into [lang]
							fs.renameSync(
								rootUriFolder,
								rootMultiLangUriFolder
							);
							return 'Successfully moved [[...uri]] folder into [lang] folder';
						} catch (error) {
							return `Error moving [[...uri]] folder: ${error.message}`;
						}
					} else {
						return '[[...uri]] folder not found, skipping move operation';
					}
				});

				// Update configs.json to set isMultilang to true and staticLang to defaultLocale
				actions.push(function (data) {
					if (fs.existsSync(configsJsonPath)) {
						try {
							const configsContent = fs.readFileSync(
								configsJsonPath,
								'utf8'
							);
							const configs = JSON.parse(configsContent);
							configs.isMultilang = true;
							configs.staticLang = data.defaultLocale;
							fs.writeFileSync(
								configsJsonPath,
								JSON.stringify(configs, null, '\t')
							);
							return (
								'Successfully updated configs.json to set isMultilang to true and staticLang to ' +
								data.defaultLocale
							);
						} catch (error) {
							return `Error updating configs.json: ${error.message}`;
						}
					} else {
						return 'configs.json file not found, skipping update';
					}
				});

				// Update provision.sh to set IS_MULTILANG
				actions.push(function (data) {
					if (fs.existsSync(provisionShPath)) {
						try {
							let provisionContent = fs.readFileSync(
								provisionShPath,
								'utf8'
							);

							// Update IS_MULTILANG variable
							provisionContent = provisionContent.replace(
								/IS_MULTILANG=\${IS_MULTILANG:=false}/g,
								'IS_MULTILANG=${IS_MULTILANG:=true}'
							);

							// Write the updated content back to the file
							fs.writeFileSync(provisionShPath, provisionContent);

							return 'Successfully updated provision.sh for set IS_MULTILANG to true';
						} catch (error) {
							return `Error updating provision.sh: ${error.message}`;
						}
					} else {
						return 'provision.sh file not found, skipping update';
					}
				});

				// Update middleware.ts with new locales
				actions.push(function (data) {
					if (fs.existsSync(middlewarePath)) {
						try {
							let middlewareContent = fs.readFileSync(
								middlewarePath,
								'utf8'
							);

							// Create the locales array with defaultLocale and additionalLocales
							const allLocales = [
								data.defaultLocale,
								...data.additionalLocales,
							];

							// Update the locales and defaultLocale variables
							middlewareContent = middlewareContent.replace(
								/const locales = \[.*?\];/,
								`const locales = ${JSON.stringify(allLocales)};`
							);
							middlewareContent = middlewareContent.replace(
								/const defaultLocale = '.*?';/,
								`const defaultLocale = '${data.defaultLocale}';`
							);

							fs.writeFileSync(middlewarePath, middlewareContent);
							return 'Successfully updated middleware.ts with new locales';
						} catch (error) {
							return `Error updating middleware.ts: ${error.message}`;
						}
					} else {
						return 'middleware.ts file not found, skipping update';
					}
				});
			} else if (data.migrationType === 'toSinglelang') {
				// Update the root layout.tsx file using the singlelang template
				actions.push({
					type: 'add',
					path: rootLayoutPath,
					templateFile:
						'./templates/lang-migration/root-layout-singlelang.tsx.hbs',
					force: true,
				});

				// Custom action to move [[...uri]] out of [lang] folder if it exists
				actions.push(function (data) {
					if (fs.existsSync(rootMultiLangUriFolder)) {
						try {
							// Move the [[...uri]] folder out of [lang]
							fs.renameSync(
								rootMultiLangUriFolder,
								rootUriFolder
							);
							return 'Successfully moved [[...uri]] folder out of [lang] folder';
						} catch (error) {
							return `Error moving [[...uri]] folder: ${error.message}`;
						}
					} else {
						return '[[...uri]] folder not found in [lang], skipping move operation';
					}
				});

				// Remove the [lang] folder
				actions.push(function (data) {
					if (fs.existsSync(relativeLangFolder)) {
						try {
							// This is a simplified removal and may not handle all edge cases
							// For a production script, use a more robust directory removal approach
							fs.rmSync(rootLangFolder, { recursive: true });
							return 'Successfully removed [lang] folder';
						} catch (error) {
							return `Error removing [lang] folder: ${error.message}`;
						}
					} else {
						return '[lang] folder not found, skipping removal';
					}
				});

				// Update configs.json to set isMultilang to false and staticLang to defaultLocale
				actions.push(function (data) {
					if (fs.existsSync(configsJsonPath)) {
						try {
							const configsContent = fs.readFileSync(
								configsJsonPath,
								'utf8'
							);
							const configs = JSON.parse(configsContent);
							configs.isMultilang = false;
							configs.staticLang = data.defaultLocale;
							fs.writeFileSync(
								configsJsonPath,
								JSON.stringify(configs, null, '\t')
							);
							return (
								'Successfully updated configs.json to set isMultilang to false and staticLang to ' +
								data.defaultLocale
							);
						} catch (error) {
							return `Error updating configs.json: ${error.message}`;
						}
					} else {
						return 'configs.json file not found, skipping update';
					}
				});

				// Update provision.sh to set IS_MULTILANG to false
				actions.push(function (data) {
					if (fs.existsSync(provisionShPath)) {
						try {
							let provisionContent = fs.readFileSync(
								provisionShPath,
								'utf8'
							);

							// Update IS_MULTILANG variable
							provisionContent = provisionContent.replace(
								/IS_MULTILANG=\${IS_MULTILANG:=true}/g,
								'IS_MULTILANG=${IS_MULTILANG:=false}'
							);

							fs.writeFileSync(provisionShPath, provisionContent);
							return 'Successfully updated provision.sh to set IS_MULTILANG to false';
						} catch (error) {
							return `Error updating provision.sh: ${error.message}`;
						}
					} else {
						return 'provision.sh file not found, skipping update';
					}
				});

				// Update middleware.ts to single language setup
				actions.push(function (data) {
					if (fs.existsSync(middlewarePath)) {
						try {
							let middlewareContent = fs.readFileSync(
								middlewarePath,
								'utf8'
							);

							// Update the locales and defaultLocale variables to use only the default locale
							middlewareContent = middlewareContent.replace(
								/let locales = \[.*?\];/,
								`let locales = ['${data.defaultLocale}'];`
							);
							middlewareContent = middlewareContent.replace(
								/let defaultLocale = '.*?';/,
								`let defaultLocale = '${data.defaultLocale}';`
							);

							fs.writeFileSync(middlewarePath, middlewareContent);
							return 'Successfully updated middleware.ts for single language setup';
						} catch (error) {
							return `Error updating middleware.ts: ${error.message}`;
						}
					} else {
						return 'middleware.ts file not found, skipping update';
					}
				});
			}

			// Format files with prettier
			actions.push(function (data) {
				exec(
					`prettier --write ${rootAppDir}/**/* --log-level=silent`,
					(error, stdout, stderr) => {
						if (error) {
							console.log(`error: ${error.message}`);
							return;
						}
						if (stderr) {
							console.log(`stderr: ${stderr}`);
							return;
						}
					}
				);
				return 'Prettier formatting completed!';
			});

			return actions;
		},
	});
};
