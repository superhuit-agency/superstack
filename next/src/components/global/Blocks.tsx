import React from 'react';

type BlockModule = {
	default: React.ElementType;
};

const blocksList: Record<string, () => Promise<BlockModule>> = {
	'core/accordion': () => import('../core/Accordion'),
	'core/accordion-heading': () => import('../core/AccordionHeading'),
	'core/accordion-item': () => import('../core/AccordionItem'),
	'core/accordion-panel': () => import('../core/AccordionPanel'),
	'core/audio': () => import('../core/Audio'),
	'core/avatar': () => import('../core/Avatar'),
	'core/block': () => import('../core/Block'),
	'core/button': () => import('../core/Button'),
	'core/buttons': () => import('../core/Buttons'),
	'core/column': () => import('../core/Column'),
	'core/columns': () => import('../core/Columns'),
	'core/categories': () => import('../core/TaxonomyList'),
	'core/code': () => import('../core/Code'),
	'core/cover': () => import('../core/Cover'),
	'core/embed': () => import('../core/Embed'),
	'core/file': () => import('../core/File'),
	'core/gallery': () => import('../core/Gallery'),
	'core/group': () => import('../core/Group'),
	'core/heading': () => import('../core/Heading'),
	'core/html': () => import('../core/CustomHtml'),
	'core/image': () => import('../core/Image'),
	'core/latest-posts': () => import('../core/LatestPosts'),
	'core/list': () => import('../core/List'),
	'core/list-item': () => import('../core/ListItem'),
	'core/math': () => import('../core/Math'),
	'core/media-text': () => import('../core/MediaText'),
	'core/navigation': () => import('../core/Navigation'),
	'core/navigation-link': () => import('../core/NavigationLink'),
	'core/navigation-submenu': () => import('../core/NavigationSubmenu'),
	'core/paragraph': () => import('../core/Paragraph'),
	'core/post-author': () => import('../core/PostAuthor'),
	'core/post-content': () => import('../core/PostContent'),
	'core/post-excerpt': () => import('../core/PostExcerpt'),
	'core/post-featured-image': () => import('../core/PostFeaturedImage'),
	'core/post-title': () => import('../core/PostTitle'),
	'core/post-author-name': () => import('../core/PostAuthorName'),
	'core/post-date': () => import('../core/PostDate'),
	'core/post-terms': () => import('../core/PostTerms'),
	'core/post-navigation-link': () => import('../core/PostNavigationLink'),
	'core/post-time-to-read': () => import('../core/PostTimeToRead'),
	'core/preformatted': () => import('../core/Preformatted'),
	'core/pullquote': () => import('../core/Pullquote'),
	'core/query': () => import('../core/Query'),
	'core/query-pagination': () => import('../core/QueryPagination'),
	'core/query-pagination-next': () => import('../core/QueryPaginationNext'),
	'core/query-pagination-numbers': () =>
		import('../core/QueryPaginationNumbers'),
	'core/query-pagination-previous': () =>
		import('../core/QueryPaginationPrevious'),
	'core/query-title': () => import('../core/QueryTitle'),
	'core/quote': () => import('../core/Quote'),
	'core/separator': () => import('../core/Separator'),
	'core/site-logo': () => import('../core/SiteLogo'),
	'core/site-tagline': () => import('../core/SiteTagline'),
	'core/site-title': () => import('../core/SiteTitle'),
	'core/social-link': () => import('../core/SocialLink'),
	'core/social-links': () => import('../core/SocialLinks'),
	'core/spacer': () => import('../core/Spacer'),
	'core/table': () => import('../core/Table'),
	'core/template-part': () => import('../core/TemplatePart'),
	'core/terms-query': () => import('../core/TermsQuery'),
	'core/verse': () => import('../core/Preformatted'),
	'core/video': () => import('../core/Video'),
	'polylang/language-switcher': () => import('../atoms/LanguageSwitcher'),
	'polylang/navigation-language-switcher': () =>
		import('../atoms/NavigationLanguageSwitcher'),
};

interface PostBodyBlocksProps {
	blocks: Array<BlockPropsType>;
	includes?: RegExp;
	excludes?: RegExp;
}

export async function Blocks({
	blocks,
	includes = /.*/g,
	excludes = /^$/g,
}: PostBodyBlocksProps) {
	const renderedBlocks = await Promise.all(
		blocks?.map(async ({ name, ...props }, i) => {
			if (!!blocksList[name as keyof typeof blocksList]) {
				if (
					new RegExp(includes).test(name) &&
					!new RegExp(excludes).test(name)
				) {
					const blockComponent =
						await blocksList[name as keyof typeof blocksList]();
					const Block = blockComponent.default;
					const { ref, ...attributes } = props.attributes;
					return (
						<Block
							key={i}
							slug={name}
							{...(ref ? { attributesRef: ref } : {})}
							{...attributes}
						>
							{props.innerBlocks && (
								<Blocks blocks={props.innerBlocks} />
							)}
						</Block>
					);
				}
			} else {
				// FALLBACK: means the block is not yet implemented in next.js
				if (process.env.NODE_ENV === 'development') {
					console.warn(
						`The following block does not exist: ${name}. This typically happens if you forget to import and render it in blocks.js. See source code for more info & solutions.`
					);
				}
			}
			return null;
		})
	);

	return <>{renderedBlocks}</>;
}
