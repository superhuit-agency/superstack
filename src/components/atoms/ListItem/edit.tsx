import block from './block.json';

/**
 * Add custom `parent` to core/list-item block
 */
const withCustomSetting = (
	settings: WpBlockType<any>['settings'],
	name: string
) => {
	if (name !== block.slug) {
		return settings;
	}

	settings['parent'] = ['core/list'];

	return settings;
};
export const ListItemEditBlockSettings: WpFilterType = {
	hook: 'blocks.registerBlockType',
	namespace: 'supt/list-item-edit-setting',
	callback: withCustomSetting,
};

export const ListItemBlock = {
	slug: block.slug,
};
