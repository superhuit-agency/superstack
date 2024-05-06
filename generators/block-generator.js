const CONFIG = require('./config');
const helpers = require('./helpers');
const chalk = require('chalk');
const { exec } = require('child_process');

const fs = require('fs');
const path = require('path');

const blockAttributeValidTypes = [
	'null',
	'boolean',
	'object',
	'array',
	'number',
	'string',
	'integer',
];

module.exports = async function (plop) {
	console.log('File loaded');

	plop.setHelper('ensurePlural', helpers.ensurePlural);
	plop.setHelper('equals', helpers.equals);
	plop.setHelper('join', helpers.join);
	plop.setHelper('ifAndCond', helpers.ifAndCond);
	plop.setHelper('ifOrCond', helpers.ifOrCond);
	plop.setHelper('ifNot', helpers.ifNot);
	plop.setHelper('hasLength', helpers.hasLength);

	await plop.load('plop-helper-slugify');

	const pascalCase = plop.getHelper('pascalCase');
	const camelCase = plop.getHelper('camelCase');
	const dashCase = plop.getHelper('dashCase');
	const slugify = plop.getHelper('slugify');

	plop.setGenerator('block', {
		description: 'Generate a new Block',
		prompts: [
			{
				type: 'list',
				name: 'blockType',
				message: "What's the block type?",
				choices: CONFIG.blockTypes,
			},
			{
				type: 'input',
				name: 'blockTitle',
				message: 'Enter the block title:',
				validate: function (value) {
					return !value ? 'Block title is required' : true;
				},
			},
			{
				type: 'input',
				name: 'blockName',
				message: 'Enter the block slug:',
				default: (prompts) => {
					return `${CONFIG.blockPrefix}/${slugify(
						prompts.blockTitle
					)}`;
				},
			},
			{
				type: 'checkbox',
				name: 'blockOptionals',
				message: 'Choose block support options:',
				choices: [
					{
						name: 'Story',
						value: 'supportsStory',
						checked: true,
					},
					{
						name: 'Inner Blocks',
						value: 'supportsInnerBlocks',
						checked: true,
					},
					{
						name: 'Data fetching/formatting',
						value: 'supportsData',
						checked: true,
					},
				],
			},
			{
				type: 'input',
				name: 'blockAttributes',
				message: `Add block attributes: ${chalk.grey(
					'[optional] space separated'
				)}`,
				filter: (input) =>
					!input ? [] : input.split(' ')?.filter(Boolean),
			},
			{
				type: 'input',
				name: 'blockAttributesTypes',
				when: (data) => data.blockAttributes.length,
				message: ({ blockAttributes }) =>
					`Add a type for each: ${chalk.gray(
						'space separated (leaving blank defaults all to null) \n[null|boolean|object|array|number|string|integer]'
					)}`,
				filter: (input) =>
					!input ? [] : input.split(' ').filter(Boolean),
				validate: (input, answers) => {
					const invalidTypesEntered = answers.blockAttributesTypes
						? answers.blockAttributesTypes.filter(
								(value) =>
									!blockAttributeValidTypes.includes(value)
							)
						: [];

					const unMatchedAttributeCount = !(
						input.length === answers.blockAttributes.length ||
						input.length === 0
					);

					if (invalidTypesEntered.length > 0)
						return `Invalid types entered: ${invalidTypesEntered.join()}`;

					if (unMatchedAttributeCount)
						return "The number of entered types doesn't match the number of attribute names…";

					return true;
				},
			},
		],
		actions: function (data) {
			const actions = [];

			// Arrange prompts data
			data.blockPrefix = CONFIG.blockPrefix;

			if (data.blockOptionals) {
				data.blockOptionals.forEach((optional) => {
					data[optional] = true;
				});
			}

			if (data.blockAttributes) {
				data.blockAttributes = data.blockAttributes.map(
					(attribute, index) => {
						return {
							name: attribute,
							type: data.blockAttributesTypes[index],
						};
					}
				);
			}

			// Cleanup data
			delete data.blockOptionals;
			delete data.blockAttributesTypes;

			const { supportsStory, supportsData } = data;

			data.unprefixedBlockName = data.blockName.replace(
				`${CONFIG.blockPrefix}/`,
				''
			);

			// Copy template files and handle block support options
			actions.push({
				type: 'addMany',
				destination: `${CONFIG.paths.relativePath}/{{ blockType }}/{{ pascalCase blockTitle }}`,
				templateFiles: './templates/block/**/*',
				base: './templates/block/',
				globOptions: {
					ignore: [
						...(!supportsStory ? ['**/*.stories.tsx.hbs'] : []),
						...(!supportsData ? ['**/data.ts.hbs'] : []),
					],
				},
			});

			// Export component in packages/blocks/components/{{blockType}}/edit.ts
			actions.push({
				type: 'modify',
				path: `${CONFIG.paths.relativePath}/{{blockType}}/edit.ts`,
				pattern: /(\/\/ -- GENERATOR EXPORT SLOT --)/gi,
				template: `export * from './{{ pascalCase blockTitle }}/edit';\r\n$1`,
			});
			if (CONFIG.outputPathType === 'core') {
				actions.push({
					type: 'modify',
					path: `${CONFIG.paths.customRelativePath}/{{blockType}}/edit.ts`,
					pattern: /(\/\/ -- GENERATOR CORE BLOCKS EXPORT SLOT --)/gi,
					template: `{{ pascalCase blockTitle }}Block,\r\n\t$1`,
				});
			}

			// Export component in packages/blocks/components/{{blockType}}/index.ts
			actions.push({
				type: 'modify',
				path: `${CONFIG.paths.relativePath}/{{blockType}}/index.ts`,
				pattern: /(\/\/ -- GENERATOR EXPORT SLOT --)/gi,
				template: `export { {{ pascalCase blockTitle }} } from './{{ pascalCase blockTitle }}';\r\n$1`,
			});
			if (CONFIG.outputPathType === 'core') {
				actions.push({
					type: 'modify',
					path: `${CONFIG.paths.customRelativePath}/{{blockType}}/index.ts`,
					pattern: /(\/\/ -- GENERATOR CORE BLOCKS EXPORT SLOT --)/gi,
					template: `{{ pascalCase blockTitle }},\r\n\t$1`,
				});
			}

			// Export component in packages/blocks/components/{{blockType}}/data.ts
			if (supportsData) {
				actions.push({
					type: 'modify',
					path: `${CONFIG.paths.relativePath}/{{blockType}}/data.ts`,
					pattern: /(\/\/ -- GENERATOR EXPORT SLOT --)/gi,
					template: `export * as {{ camelCase blockTitle }}Data from './{{ pascalCase blockTitle }}/data';\r\n$1`,
				});
				if (CONFIG.outputPathType === 'core') {
					actions.push({
						type: 'modify',
						path: `${CONFIG.paths.customRelativePath}/{{blockType}}/data.ts`,
						pattern:
							/(\/\/ -- GENERATOR CORE BLOCKS EXPORT SLOT --)/gi,
						template: `{{ camelCase blockTitle }}Data,\r\n\t$1`,
					});
				}
			}

			// Import component in Blocks.tsx
			actions.push({
				type: 'modify',
				path: `${CONFIG.paths.relativePath}/global/Blocks.tsx`,
				pattern: /(\/\/ -- GENERATOR IMPORT SLOT --)/gi,
				template: `{{ pascalCase blockTitle }},\r\n$1`,
			});

			// Add component to Blocks.tsx
			actions.push({
				type: 'modify',
				path: `${CONFIG.paths.relativePath}/global/Blocks.tsx`,
				pattern: /(\/\/ -- GENERATOR BLOCK SLOT --)/gi,
				template: `'{{ blockName }}': {{ pascalCase blockTitle }},\r\n\t\t$1`,
			});

			actions.push(function (data) {
				const { blockType, blockTitle } = data;

				const outputBlockPath = `${
					CONFIG.paths.rootPath
				}/${blockType}/${pascalCase(blockTitle)}`;

				exec(
					`prettier --write ${outputBlockPath}/**/* --log-level=silent`,
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
				return 'Prettier done!';
			});

			return actions;
		},
	});

	// Copy a folder (recursive function)
	function copyDir(src, dest) {
		fs.mkdirSync(dest, { recursive: true }); // Create new directory

		// Read source directory
		let entries = fs.readdirSync(src, {
			withFileTypes: true,
		});

		for (let entry of entries) {
			let srcPath = path.join(src, entry.name);
			let destPath = path.join(dest, entry.name);

			entry.isDirectory()
				? copyDir(srcPath, destPath)
				: fs.copyFileSync(srcPath, destPath);
		}
	}

	// Look for a folder
	function findDir(src, dirName, dirPath) {
		let entries = fs.readdirSync(src, {
			withFileTypes: true,
		});

		for (let entry of entries) {
			if (entry.isDirectory()) {
				let srcPath = path.join(src, entry.name);

				if (entry.name === dirName) {
					// It's the directory we're looking for
					dirPath = srcPath;
				} else {
					// Continue to look
					dirPath = findDir(srcPath, dirName, dirPath);
				}
			}
		}

		return dirPath;
	}
};
