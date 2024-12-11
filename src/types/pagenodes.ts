import { getTemplateData } from '@/lib/get-node-by-uri';
import { formatBlocksJSON } from '../lib';

/**
 * Page Node object
 */

class PageNodeData {
	__typename: string;
	title: string;
	baseUrl: string;
	editLink?: string;
	seo: PageSeo;
	uri: string;

	constructor(data: PageNodeData) {
		this.__typename = data.__typename;
		this.title = data.title;
		this.baseUrl = data.baseUrl;
		this.editLink = data.editLink;
		this.seo = data.seo;
		this.uri = data.uri;
	}
}

class MultilingualPageNodeData extends PageNodeData {
	language?: Language;
	translation: PageNodeData;
	translations?: Array<PageNodeLanguage>;

	constructor(data: MultilingualPageNodeData) {
		super(data);
		this.language = data.language;
		this.translation = data.translation;
		this.translations = data.translations;
	}
}

export class PageNode extends PageNodeData {
	fullUri: string;
	blocksJSON: Array<any>;

	constructor(data: PageNodeData, fullUri: string) {
		super(data);
		this.fullUri = fullUri;
		this.blocksJSON = [];
	}

	async enrichBlocks(blocksJSON: string) {
		const { blocks, templateData } = await Promise.allSettled([
			formatBlocksJSON(blocksJSON),
			getTemplateData(this),
		])
			.then(([bProm, tProm]) => ({
				blocks: bProm.status === 'fulfilled' ? bProm.value : [],
				templateData: tProm.status === 'fulfilled' ? tProm.value : {},
			}))
			.catch(() => {
				console.error(
					'Error while enriching & formatting blocksJSON and templateData'
				);
				return { blocks: [], templateData: {} };
			});

		this.blocksJSON = blocks;
		Object.assign(this, templateData);
	}

	getSEOUrl() {
		// To be tested, original seems wrong
		return this.seo?.opengraphUrl?.startsWith('https')
			? this.seo?.opengraphUrl
			: '/';
	}
	getCanonicalUrl(): string {
		if (this.seo?.canonical) {
			return this.seo.canonical;
		} else {
			return `${this?.baseUrl || ''}${this.uri ?? '/'}`;
		}
	}
}

export class MultilingualPageNode extends PageNode {
	translations?: Array<PageNodeLanguage>;
	language?: Language;

	constructor(data: MultilingualPageNodeData, fullUri: string) {
		super(data as PageNodeData, fullUri);
		this.translations = data.translations;
		this.language = data.language;
	}

	getSEOUrl() {
		// To be tested, original seems wrong
		if (this.seo?.opengraphUrl?.startsWith('https'))
			return this.seo?.opengraphUrl;
		return (
			(this.language ? `/${this.language.code.toLowerCase()}/` : '/') +
			this.seo?.opengraphUrl
		);
	}
	getCanonicalUrl(): string {
		if (this.seo?.canonical) {
			return this.seo.canonical;
		} else if (this.uri === '/' && this.language) {
			return `${this?.baseUrl || ''}/${this.language.code.toLowerCase()}/`;
		} else {
			return `${this?.baseUrl || ''}${this.uri ?? '/'}`;
		}
	}
}

export class TemplateNode extends PageNode implements ITemplateNode {
	siteSEO: {
		schema: {
			siteName: string;
			siteUrl: string;
			companyName: string;
		};
		social?: any;
		openGraph: {
			defaultImage: {
				src: string;
			};
		};
	};
	siteSettings: {
		title: string;
	};

	constructor(response: AppNodeQueryResponse, fullUri: string) {
		super(response.node, fullUri);

		this.siteSEO = response.seo;
		this.siteSettings = response.generalSettings;
	}
}

export class MultilingualTemplateNode
	extends MultilingualPageNode
	implements ITemplateNode
{
	siteSEO: any;
	siteSettings: any;

	constructor(
		response: AppNodeQueryResponse,
		fullUri: string,
		configs: ConfigsType
	) {
		if (!(response.node instanceof MultilingualPageNodeData))
			throw new Error('Node is not a MultilingualPageNodeData');

		super(response.node, fullUri);

		this.siteSEO = response.seo;
		this.siteSettings = response.generalSettings;
		this.configureMultilang(configs);
	}

	configureMultilang(configs: ConfigsType) {
		/**
		 * Adjust node for Multilang
		 */
		// Update translations to push current uri in translations
		if (configs.hasCurrentLocaleInLangSwitcher) {
			if (!this.translations) this.translations = [];

			if (!this.language?.locale || !this.language?.code)
				throw new Error('Language not found');

			this.translations.unshift({
				uri: this.uri,
				language: {
					locale: this.language.locale,
					code: this.language.code,
				},
			});
		}
	}
}
