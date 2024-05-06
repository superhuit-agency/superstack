import cx from 'classnames';
import { useMemo } from 'react';

import { useTranslation } from '@/hooks/use-translation';
import { Link } from '@/helpers/Link';
import { Blocks, Container } from '@/components/global';
import { CardNewsProps } from '@/components/molecules/cards/CardNews';
import { Pagination, Button, CardNews } from '@/components';
import { BlockPropsType, LinkProps } from '@/typings';

import { ArchivePostData } from './data';
import './styles.css';

type TaxonomyType = LinkProps & {
	isActive?: boolean;
};

interface PageProps {
	node: ArchivePostData & any;
}

export default function Page({ node }: PageProps) {
	const __t = useTranslation();

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
	}: ArchivePostData = node ?? {};

	// Format categories list
	const allCategories = useMemo(() => {
		return [
			{
				title: __t('archive-post-all', 'Toutes'),
				href: baseUri,
				isActive: baseUri === node.uri,
			},
			...categories,
		];
	}, [categories, baseUri, node.uri, __t]);

	return (
		<>
			<Blocks
				blocks={node.blocksJSON as BlockPropsType[]}
				includes={/page-header/g}
			/>
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
							<span>{__t('archive-post-tags', 'Tags')}:</span>
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
