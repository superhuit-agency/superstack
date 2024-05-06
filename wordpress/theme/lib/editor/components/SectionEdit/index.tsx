import React, { FC } from 'react';
import { _x } from '@wordpress/i18n';
import { RichText } from '@wordpress/block-editor';
import { SectionProps } from '@/typings';

type SubcomponentEditProps = {
	onChange: Function;
	attribute?: string;
};

/**
 * SUBCOMPONENTS
 */
const Uptitle: FC<SubcomponentEditProps> = ({
	onChange,
	attribute: uptitle,
}) => (
	<RichText
		className="supt-section__uptitle"
		tagName="p"
		placeholder={_x('Add an uptitle', 'Section', 'supt')}
		value={uptitle || ''}
		onChange={(uptitle: string) => onChange(uptitle)}
		allowedFormats={[]}
	/>
);

const Title: FC<SubcomponentEditProps> = ({ onChange, attribute: title }) => (
	<RichText
		className="supt-section__title"
		tagName="h2"
		placeholder={_x('Add a title', 'Section', 'supt')}
		value={title || ''}
		onChange={(title: string) => onChange(title)}
		allowedFormats={[]}
	/>
);

const Introduction: FC<SubcomponentEditProps> = ({
	onChange,
	attribute: introduction,
}) => (
	<RichText
		className="supt-section__introduction"
		placeholder={_x('Add an introduction', 'Section', 'supt')}
		value={introduction || ''}
		onChange={(introduction: string) => onChange(introduction)}
		allowedFormats={['core/bold', 'core/italic', 'core/link']}
	/>
);

/**
 * COMPONENT
 */
export const SectionEdit = (props: SectionProps) => props.children;

SectionEdit.Uptitle = Uptitle;
SectionEdit.Title = Title;
SectionEdit.Introduction = Introduction;
