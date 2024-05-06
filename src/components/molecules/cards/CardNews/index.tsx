import { FC, useCallback, useMemo } from 'react';

import configs from '@/configs.json';
import { Link } from '@/helpers/Link';
import { useTranslation } from '@/hooks/use-translation';
import { BlockConfigs, ImageProps, LinkProps } from '@/typings';
import { phpToJsDateFormat } from '@/utils';

import { Image } from '../..';
import block from './block.json';
import './styles.css';

/**
 * TYPINGS
 */
export type CardNewsProps = {
	image?: ImageProps;
	category?: LinkProps;
	date: string;
	title: string;
	excerpt?: string;
	uri: string;
	linkLabel?: string;
};

/**
 * COMPONENTS
 */
export const CardNews: FC<CardNewsProps> & BlockConfigs = ({
	image,
	category,
	date,
	title,
	excerpt,
	uri,
	linkLabel,
	...linkProps
}) => {
	const locale = configs.staticLang; // TODO :: HANDLE THIS !!!

	const __t = useTranslation();

	const formatDate = useCallback(
		(date: string) =>
			new Date(date.replace(' ', 'T')).toLocaleDateString(
				locale,
				phpToJsDateFormat(__t('date_format', configs.dateFormat ?? ''))
			),
		[__t, locale]
	);
	const removeTags = useCallback((str: string) => {
		if (str === null || str === '') return false;
		else str = str.toString();
		return str.replace(/(<([^>]+)>)/gi, '');
	}, []);

	const formatedDate = useMemo(() => formatDate(date), [date, formatDate]);
	const stripedExcerpt = useMemo(
		() => (excerpt ? removeTags(excerpt) : ''),
		[excerpt, removeTags]
	);

	return (
		<article className="supt-card supt-card-news">
			{image?.src ? (
				<Image
					{...image}
					alt={image.alt || title}
					className="supt-card-news__image"
					sizes="(max-width: 768px) 100vw,
              		 (max-width: 1200px) 50vw,
              		 33vw"
					fill
				/>
			) : null}
			<div className="supt-card-news__inner">
				<div className="supt-card-news__content">
					<div className="supt-card-news__metas">
						{category?.href ? (
							<Link
								className="supt-card-news__category"
								{...category}
							>
								{category.title}
							</Link>
						) : null}
						<p className="supt-card-news__date">{formatedDate}</p>
					</div>
					<h3 className="supt-card-news__title">
						<Link
							href={uri}
							dangerouslySetInnerHTML={{ __html: title }}
							{...(linkProps as any)}
						/>
					</h3>
					{excerpt && (
						<p
							className="supt-card-news__excerpt"
							dangerouslySetInnerHTML={{ __html: stripedExcerpt }}
						/>
					)}
				</div>
				<p className="supt-card-news__read">
					{linkLabel || __t('card-news-read', 'Read')}
				</p>
			</div>
		</article>
	);
};

CardNews.slug = block.slug;
CardNews.title = block.title;
