import React from 'react';

import Accordion from '../core/Accordion';
import AccordionHeading from '../core/AccordionHeading';
import AccordionItem from '../core/AccordionItem';
import AccordionPanel from '../core/AccordionPanel';
import Audio from '../core/Audio';
import Avatar from '../core/Avatar';
import ReusableBlock from '../core/Block';
import Button from '../core/Button';
import Buttons from '../core/Buttons';
import Column from '../core/Column';
import Columns from '../core/Columns';
import TaxonomyList from '../core/TaxonomyList';
import Code from '../core/Code';
import Cover from '../core/Cover';
import Embed from '../core/Embed';
import File from '../core/File';
import Gallery from '../core/Gallery';
import Group from '../core/Group';
import Heading from '../core/Heading';
import CustomHtml from '../core/CustomHtml';
import Image from '../core/Image';
import LatestPosts from '../core/LatestPosts';
import List from '../core/List';
import ListItem from '../core/ListItem';
import Math from '../core/Math';
import MediaText from '../core/MediaText';
import Navigation from '../core/Navigation';
import NavigationLink from '../core/NavigationLink';
import NavigationSubmenu from '../core/NavigationSubmenu';
import Paragraph from '../core/Paragraph';
import PostAuthor from '../core/PostAuthor';
import PostContent from '../core/PostContent';
import PostExcerpt from '../core/PostExcerpt';
import PostFeaturedImage from '../core/PostFeaturedImage';
import PostTitle from '../core/PostTitle';
import PostAuthorName from '../core/PostAuthorName';
import PostTerms from '../core/PostTerms';
import PostNavigationLink from '../core/PostNavigationLink';
import PostTimeToRead from '../core/PostTimeToRead';
import Preformatted from '../core/Preformatted';
import Pullquote from '../core/Pullquote';
import Query from '../core/Query';
import QueryPagination from '../core/QueryPagination';
import QueryPaginationNext from '../core/QueryPaginationNext';
import QueryPaginationNumbers from '../core/QueryPaginationNumbers';
import QueryPaginationPrevious from '../core/QueryPaginationPrevious';
import QueryTitle from '../core/QueryTitle';
import Quote from '../core/Quote';
import Separator from '../core/Separator';
import SiteLogo from '../core/SiteLogo';
import SiteTagline from '../core/SiteTagline';
import SiteTitle from '../core/SiteTitle';
import SocialLink from '../core/SocialLink';
import SocialLinks from '../core/SocialLinks';
import Spacer from '../core/Spacer';
import Table from '../core/Table';
import TemplatePart from '../core/TemplatePart';
import TermName from '../core/TermName';
import TermsQuery from '../core/TermsQuery';
import Video from '../core/Video';
import LanguageSwitcher from '../atoms/LanguageSwitcher';
import NavigationLanguageSwitcher from '../atoms/NavigationLanguageSwitcher';
import YoastBreadcrumbs from '../core/YoastBreadcrumbs';

import { PostDate } from './ClientBlocks';

// Static imports: Turbopack emits one CSS file per dynamically imported module,
// which made every block stylesheet a separate render-blocking request.
// Client Components are code-split per block in `./ClientBlocks`, except the
// navigation ones: they are on every page, so splitting them only adds requests.
const blocksList: Record<string, React.ElementType> = {
	'core/accordion': Accordion,
	'core/accordion-heading': AccordionHeading,
	'core/accordion-item': AccordionItem,
	'core/accordion-panel': AccordionPanel,
	'core/audio': Audio,
	'core/avatar': Avatar,
	'core/block': ReusableBlock,
	'core/button': Button,
	'core/buttons': Buttons,
	'core/column': Column,
	'core/columns': Columns,
	'core/categories': TaxonomyList,
	'core/code': Code,
	'core/cover': Cover,
	'core/embed': Embed,
	'core/file': File,
	'core/gallery': Gallery,
	'core/group': Group,
	'core/heading': Heading,
	'core/html': CustomHtml,
	'core/image': Image,
	'core/latest-posts': LatestPosts,
	'core/list': List,
	'core/list-item': ListItem,
	'core/math': Math,
	'core/media-text': MediaText,
	'core/navigation': Navigation,
	'core/navigation-link': NavigationLink,
	'core/navigation-submenu': NavigationSubmenu,
	'core/paragraph': Paragraph,
	'core/post-author': PostAuthor,
	'core/post-content': PostContent,
	'core/post-excerpt': PostExcerpt,
	'core/post-featured-image': PostFeaturedImage,
	'core/post-title': PostTitle,
	'core/post-author-name': PostAuthorName,
	'core/post-date': PostDate,
	'core/post-terms': PostTerms,
	'core/post-navigation-link': PostNavigationLink,
	'core/post-time-to-read': PostTimeToRead,
	'core/preformatted': Preformatted,
	'core/pullquote': Pullquote,
	'core/query': Query,
	'core/query-pagination': QueryPagination,
	'core/query-pagination-next': QueryPaginationNext,
	'core/query-pagination-numbers': QueryPaginationNumbers,
	'core/query-pagination-previous': QueryPaginationPrevious,
	'core/query-title': QueryTitle,
	'core/quote': Quote,
	'core/separator': Separator,
	'core/site-logo': SiteLogo,
	'core/site-tagline': SiteTagline,
	'core/site-title': SiteTitle,
	'core/social-link': SocialLink,
	'core/social-links': SocialLinks,
	'core/spacer': Spacer,
	'core/table': Table,
	'core/template-part': TemplatePart,
	'core/term-name': TermName,
	'core/terms-query': TermsQuery,
	'core/verse': Preformatted,
	'core/video': Video,
	'polylang/language-switcher': LanguageSwitcher,
	'polylang/navigation-language-switcher': NavigationLanguageSwitcher,
	'yoast-seo/breadcrumbs': YoastBreadcrumbs,
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
					const Block = blocksList[name as keyof typeof blocksList];
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
