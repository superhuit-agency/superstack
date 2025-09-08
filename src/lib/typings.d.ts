interface MultisiteConfig {
	domain: string;
	region: string;
	basePath: string;
	wpUrl: string;
}

interface AppConfigs {
	isMultilang: boolean;
	staticLang: string;
	hasCurrentLocaleInLangSwitcher: boolean;
	dateFormat: string;
	multisite: MultisiteConfig[];
}
