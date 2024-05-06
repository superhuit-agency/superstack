import configs from '@/configs.json';

export const translationsFields = configs.isMultilang
	? `translations {
		uri
		language {
			locale
			code
		}
	}`
	: '';
