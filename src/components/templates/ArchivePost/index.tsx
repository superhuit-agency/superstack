'use client';

import cx from 'classnames';
import { useMemo } from 'react';

import { useLocale } from '@/contexts/locale-context';
import { Link } from '@/components/atoms/Link';
import { Blocks, Container } from '@/components/global';
import { Pagination, Button, CardNews } from '@/components';

import './styles.css';

export default function Page({ node }: ArchivePostProps) {
	const { dictionary } = useLocale();

	const {
		archivePage: {
			baseUri,
			posts = [],
			categories = [],
			tags = [],
			pagination = {
				current: 1,
				total: 1,
			},
		},
	} = node ?? {};

	// Format categories list
	const allCategories = useMemo(() => {
		return [
			{
				title: dictionary.archivePost?.all,
				href: baseUri,
				isActive: baseUri === node.uri,
			},
			...categories,
		];
	}, [categories, baseUri, node.uri, dictionary]);

	return (
		<>
			<Blocks blocks={node.blocksJSON} includes={/page-header/g} />
			<Container className="supt-archive-post supt-section">
				<div className="supt-archive-post__inner">
					{/* list categories */}
					<ul className="supt-archive-post__categories">
						{allCategories.map(
							({ isActive, ...cat }: TaxonomyType, id) => (
								<li
									key={id}
									className="supt-archive-post__category"
								>
									<Button
										{...cat}
										className={cx({
											'-is-current': isActive,
										})}
									/>
								</li>
							)
						)}
					</ul>

					{/* list tags */}
					{tags.length ? (
						<div className="supt-archive-post__tags">
							<span>{dictionary.archivePost?.tags}:</span>
							{tags.map(
								({
									id,
									href,
									title,
									isActive,
								}: TaxonomyType) => (
									<Link
										key={id}
										href={href}
										className={cx({
											'-is-current': isActive,
										})}
										data-no-scrollreset
									>
										{title}
									</Link>
								)
							)}
						</div>
					) : null}

					{/* list posts */}
					<div className="supt-archive-post__list">
						{posts?.map((post: CardNewsProps, index: number) => (
							<CardNews key={index} {...post} />
						))}
					</div>

					{/* Pagination */}
					{pagination.total > 1 ? (
						<Pagination
							baseUri={node.uri || ''}
							currentPagination={pagination.current || 1}
							totalPages={pagination.total}
						/>
					) : null}

					<Blocks
						blocks={node.blocksJSON as BlockPropsType[]}
						excludes={/page-header/g}
					/>
				</div>
			</Container>
		</>
	);
}
