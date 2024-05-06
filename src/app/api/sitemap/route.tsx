import { getSitemapData } from '@/lib';
import { type NextRequest } from 'next/server';

type ContentTypeSitemapDataType = {
	name: string;
	total: number;
	lastModified: string;
};

type DataType = {
	uri: string;
	modified: Date | string | number;
	translations?:
		| {
				uri: string;
				code: string;
		  }[]
		| undefined;
	images?: { uri: string; title: string }[] | undefined;
}[];

const MAX_NB_URLS = 1000;
// 1 hour * 60 minutes * 60 seconds
const HOUR_IN_SECONDS = 1 * 60 * 60;
// // 1 year * 365 days * 24 hours * 1 HOUR
// const YEAR_IN_SECONDS = 1 * 365 * 24 * HOUR_IN_SECONDS;

const wrapSitemapXML = (origin: string, content: string) =>
	`<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="${origin}/sitemap-stylesheet.min.xsl"?>
${content}
`;

const createTypeSitemap = (data: DataType, origin: string) =>
	wrapSitemapXML(
		origin,
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">' +
			data
				.map(
					({ uri, modified, translations = [], images = [] }) =>
						`<url>
		<loc>${origin}${uri}</loc>
		<lastmod>${modified}</lastmod>
		${translations
			.map(
				({ uri: tUri, code }) =>
					`<xhtml:link href="${origin}${tUri}" hreflang="${code.toLowerCase()}" rel="alternate"/>`
			)
			.join('\n\t\t')}
		${images
			.map(
				({ uri: iUri, title }) =>
					`<image:image>
				<image:loc>${origin}${iUri}</image:loc>
				<image:title><![CDATA[${title}]]></image:title>
			</image:image>`
			)
			.join('\n\t\t')}
	</url>`
				)
				.join('\n\t') +
			'\n</urlset>'
	);

const createIndexSitemap = (
	postTypes: Array<ContentTypeSitemapDataType>,
	origin: string
) =>
	wrapSitemapXML(
		origin,
		`<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
				${postTypes
					.map(
						({
							name,
							total,
							lastModified,
						}: ContentTypeSitemapDataType) => {
							const nb_sitemaps = Math.ceil(total / MAX_NB_URLS);
							if (nb_sitemaps > 1) {
								return new Array(nb_sitemaps)
									.fill(0)
									.map(
										(v, i) =>
											`<sitemap>
											<loc>${origin}/sitemap-${name}-${i + 1}.xml</loc>
											<lastmod>${lastModified}</lastmod>
										</sitemap>`
									)
									.join('\n\t');
							} else {
								return `<sitemap>
										<loc>${origin}/sitemap-${name}.xml</loc>
										<lastmod>${lastModified}</lastmod>
									</sitemap>`;
							}
						}
					)
					.join('\n\t')}
				</sitemapindex>`
	);

export async function GET(request: NextRequest) {
	const [match, type = 'all', page = '1']: RegExpMatchArray | [] =
		request.url.match(/sitemap-([^-]*)(?:-(\d+))?.xml/) || [];

	const data = await getSitemapData(type, parseInt(page), MAX_NB_URLS);

	return new Response(
		match
			? createTypeSitemap(data, request.nextUrl.origin)
			: createIndexSitemap(data, request.nextUrl.origin),
		{
			status: 200,
			headers: {
				'Content-Type': 'text/xml; charset=UTF-8',
				// Prevent the search engines from indexing the XML Sitemap.
				'X-Robots-Tag': 'noindex, follow',
				// Make the browser cache this file properly.
				Pragma: 'public',
				'Cache-Control': `max-age=${HOUR_IN_SECONDS}`,
			},
		}
	);
}
