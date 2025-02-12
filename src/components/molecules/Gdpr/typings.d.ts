type GdprConfigs = {
	cookieName?: string;
	hash?: string;
	categories?: Array<GdprCategoryConfigs>;
	texts?: {
		banner?: object;
		modal?: object;
	};
};

type GdprAttributes = {
	configs: GdprConfigs;
	preview: boolean;
};

type GdprProps = GdprAttributes & ThemeProps;

type AdapterProps = GdprAttributes;
