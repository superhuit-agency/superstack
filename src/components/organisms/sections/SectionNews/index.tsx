import { FC } from 'react';
import cx from 'classnames';

import { Link } from '@/helpers/Link';
import { Section } from '@/helpers/Section';
import { BlockConfigs, SectionProps, LinkProps } from '@/typings';
import { CardNewsProps, CardNews } from '@/components/molecules/cards/CardNews';

import block from './block.json';

// styles
import './styles.css';

/**
 * TYPINGS
 */

export interface SectionNewsPost {
	posts: Array<CardNewsProps>;
}

export interface SectionNewsProps extends SectionNewsPost, SectionProps {
	seeAllLink: LinkProps;
	postLinkLabel?: string;
	queryVars?: Record<string, any>;
}

/**
 * COMPONENT
 */
export const SectionNews: FC<SectionNewsProps> & BlockConfigs = ({
	anchor,
	className,
	uptitle,
	title,
	introduction,
	seeAllLink,
	posts,
	postLinkLabel,
}) => {
	return (
		<section
			id={anchor}
			className={cx('supt-section', 'supt-section-news', className)}
		>
			<div className="supt-section__inner">
				<div className="supt-section__headline">
					{uptitle && <Section.Uptitle text={uptitle} />}
					{title && <Section.Title text={title} />}
					{introduction && (
						<Section.Introduction text={introduction} />
					)}
				</div>
				<div className="supt-section__content">
					<div className="supt-section__list">
						{posts?.map((post, index) => (
							<CardNews
								key={index}
								linkLabel={postLinkLabel}
								{...post}
							/>
						))}
					</div>

					{seeAllLink?.href ? (
						<div className="supt-section__link-wrapper">
							<Link
								className="supt-section__link"
								{...(seeAllLink as any)}
							>
								{seeAllLink?.title}
							</Link>
						</div>
					) : null}
				</div>
			</div>
		</section>
	);
};

SectionNews.slug = block.slug;
SectionNews.title = block.title;
