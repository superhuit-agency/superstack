import configs from '@/configs.json';

export const languageFields = configs.isMultilang
	? `language {
		code
		locale
	}`
	: '';
