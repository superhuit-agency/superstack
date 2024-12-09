const fs = require('fs');

const defaultOutputPaths = {
	relativePath: '../src/components',
	rootPath: 'src/components',
};

/**
 * Checks for the existance of output paths and throw error if none exist
 */
const blocksPresent = fs.existsSync(defaultOutputPaths.rootPath);

if (!blocksPresent) {
	throw new Error(
		`Error. Output path not found in "${defaultOutputPaths.relativePath}"".`
	);
}

module.exports = {
	paths: defaultOutputPaths,
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
};
