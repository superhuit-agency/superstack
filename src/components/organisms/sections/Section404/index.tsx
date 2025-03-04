'use client';

import { FC } from 'react';

import { useLocale } from '@/contexts/locale-context';
import { Button } from '@/components/atoms';

import configs from '@/configs.json';
import block from './block.json';

import './styles.css';

export const Section404: FC<Section404Props> & BlockConfigs = ({}) => {
	const { dictionary, locale } = useLocale();

	return (
		<section className="supt-section supt-section-404">
			<div className="supt-section__inner">
				<div className="supt-section__content">
					<h1 className="supt-section__title">
						{dictionary.page404.title}
					</h1>
					<p className="supt-section__description">
						{dictionary.page404.description}
					</p>
					<Button
						href={configs.isMultilang ? `/${locale}/` : '/'}
						title={dictionary.page404.buttonLabel}
					/>
				</div>
			</div>
		</section>
	);
};

Section404.slug = block.slug;
Section404.title = block.title;
