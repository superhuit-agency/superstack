type Locale = 'fr' | 'en';
type Dictionary = Record<string, any>;

interface Language {
	locale: string;
	code: string;
}

interface Translation {
	uri: string;
	language: Language;
}
