type Locale = 'fr' | 'en';
type Dictionary = Record<string, any>;

interface Translation {
	uri: string;
	language: {
		locale: string;
		code: string;
	};
}
