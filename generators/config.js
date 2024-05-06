const fs = require('fs');

const defaultOutputPaths = {
	core: {
		relativePath: '../packages/blocks/components',
		rootPath: 'packages/blocks/components',
		forkPath: 'packages/blocks/components',
		customRelativePath: '../src/components',
	},
	custom: {
		relativePath: '../src/components',
		rootPath: 'src/components',
	},
};

/**
 * Checks for the existance of output paths and throw error if none exist
 */
const coreBlocksPresent = fs.existsSync(defaultOutputPaths.core.rootPath);
const customBlocksPresent = fs.existsSync(defaultOutputPaths.custom.rootPath);

const outputPathType = coreBlocksPresent ? 'core' : 'custom';

if (!coreBlocksPresent && !customBlocksPresent) {
	throw new Error(
		`Error. Output path not found in "${defaultOutputPaths.core.rootRelativePath}" or "${defaultOutputPaths.custom.rootRelativePath}"".`
	);
}

module.exports = {
	paths: defaultOutputPaths[outputPathType],
	blockTypes: [
		{
			name: 'Atom',
			value: 'atoms',
		},
		{
			name: 'Molecule',
			value: 'molecules',
		},
		{
			name: 'Organism',
			value: 'organisms',
		},
	],
	blockPrefix: 'supt',
	outputPathType,
};
