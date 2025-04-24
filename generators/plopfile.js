module.exports = async (plop) => {
	await plop.load('./block-generator.js');
	await plop.load('./lang-migration-generator.js');
};
