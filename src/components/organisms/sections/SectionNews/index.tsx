import { FC } from 'react';
import cx from 'classnames';

import { Link } from '@/components/atoms/Link';
import { Section } from '@/helpers/Section';

import { CardNews } from '@/components/molecules/cards/CardNews';

import block from './block.json';

// styles
import './styles.css';

export const SectionNews: FC<SectionNewsProps> & BlockConfigs = ({
	anchor,
	className,
	uptitle,
	title,
	introduction,
	posts,
	postLinkLabel,
	children, // For the button "See all news"
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

					{children ? (
						<div className="supt-section__link-wrapper">
							{children}
						</div>
					) : null}
				</div>
			</div>
		</section>
	);
};

SectionNews.slug = block.slug;
SectionNews.title = block.title;
