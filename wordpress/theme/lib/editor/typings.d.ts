declare global {
	interface Window {
		supt: any;
	}
}

type useGraphQlApiResponse = {
	isLoading: boolean;
	data: any;
};

interface WpTermRest {
	id: number;
	count: number;
	description: string;
	link: string;
	name: string;
	slug: string;
	taxonomy: string;
	meta: Array<any>;
	acf?: any;
	_links: any;
}

type WP_REST_RESPONSE_TYPES =
	| WpMediaRest
	| WpPostRest
	| WpTermRest
	| Array<WpMediaRest>
	| Array<WpPostRest>
	| Array<WpTermRest>;

type useRestAPIResponse<T> = {
	isLoading: boolean;
	data: T;
};

interface WpPostRest {
	_links: any;
	acf?: any;
	author: number;
	categories?: Array<any>;
	comment_status: string;
	content: {
		raw: string;
		rendered: string;
		protected: boolean;
		block_version: number;
	};
	date: string;
	date_gmt: string;
	excerpt: { raw: string; rendered: string; protected: boolean };
	featured_media: number;
	generated_slug: string;
	guid: { raw: string; rendered: string };
	id: number;
	lang?: string;
	link: string;
	menu_order: number;
	meta: any;
	modified: string;
	modified_gmt: string;
	parent: number;
	password: string;
	permalink_template: string;
	ping_status: string;
	slug: string;
	status: string;
	tags?: Array<any>;
	template: string;
	title: { raw: string; rendered: string };
	translations?: any;
	translations_table?: any;
	type: string;
}

interface WpMediaRest {
	id: number;
	date: string;
	date_gmt: string;
	guid: {
		rendered: string;
	};
	modified: string;
	modified_gmt: string;
	slug: string;
	status: string;
	type: string;
	link: string;
	title: { rendered: string };
	author: number;
	comment_status: string;
	ping_status: string;
	template: string;
	meta: any;
	acf?: any;
	yoast_head?: string;
	yoast_head_json?: any;
	lang?: string;
	translations?: any;
	pll_sync_post?: [];
	description: { rendered: string };
	caption: { rendered: string };
	alt_text: string;
	media_type: string;
	mime_type: string;
	media_details: {
		width: number;
		height: number;
		file: string;
		sizes: any;
		image_meta: any;
	};
	post: number;
	source_url: string;
	_links: any;
}
