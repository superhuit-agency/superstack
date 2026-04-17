'use client';

import { useMemo } from 'react';

import { useLocale } from '@/contexts/locale-context';
import { Link } from '@/helpers/Link';
import { Blocks, Container } from '@/components/global';
import { SectionNews, Image } from '@/components';

import './styles.css';

export default function Post({ node }: any) {
	const { dictionary, locale } = useLocale();

	const postStructuredData = {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: node.title,
		image: node.seo?.opengraphImage?.src,
		datePublished: node.date ? new Date(node.date).toISOString() : '',
	};

	const postDate = useMemo(
		() =>
			new Date(node.date).toLocaleDateString(locale, {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
			}),
		[node.date, locale]
	);

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(postStructuredData),
				}}
				key="post-jsonld"
			/>
			<Container className="supt-single-post">
				<div className="supt-single-post__inner">
					<div className="supt-single-post__meta">
						<h1>{node.title}</h1>

						{node.categories?.nodes.length > 0 && (
							<>
								<Link href={node.categories.nodes[0].uri}>
									{node.categories.nodes[0].name}
								</Link>{' '}
								-{' '}
							</>
						)}

						{postDate}
					</div>
					{node?.featuredImage?.node?.src ? (
						<div className="supt-single-post__image">
							<Image
								src={node.featuredImage.node.sourceUrl}
								width={
									node.featuredImage.node.mediaDetails?.width
								}
								height={
									node.featuredImage.node.mediaDetails?.height
								}
								alt={
									node.featuredImage.node.altText ||
									node.title
								}
								caption={
									<span
										dangerouslySetInnerHTML={{
											__html: node.featuredImage.node
												.caption,
										}}
									></span>
								}
								sizes="100vw"
							/>
						</div>
					) : null}
					<div className="supt-single-post__content">
						<Blocks
							blocks={node.blocksJSON}
							excludes={/^supt\/page-header/g}
						/>
					</div>
				</div>
				{node?.relatedPosts?.length ? (
					<SectionNews
						uptitle={dictionary.post?.relatedNews}
						seeAllLink={{
							title: dictionary.post?.seeAll,
							href: node?.postsPage.uri,
						}}
						posts={node.relatedPosts}
					/>
				) : null}
			</Container>
		</>
	);
}
