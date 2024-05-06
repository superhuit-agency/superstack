import { FC } from 'react';
import { SectionProps } from '@/typings';

type SubcomponentProps = {
	text: string;
};
type SubcomponentTitleProps = SubcomponentProps & {
	titleLevel?: number;
};

/**
 * SUBCOMPONENTS
 */
const Uptitle: FC<SubcomponentProps> = ({ text }) => (
	<p
		className="supt-section__uptitle"
		dangerouslySetInnerHTML={{
			__html: text,
		}}
	/>
);

const Title: FC<SubcomponentTitleProps> = ({ text, titleLevel = 2 }) => {
	const TitleTag = `h${titleLevel}` as keyof JSX.IntrinsicElements;

	return (
		<TitleTag
			className="supt-section__title"
			dangerouslySetInnerHTML={{ __html: text }}
		/>
	);
};

const Introduction: FC<SubcomponentProps> = ({ text }) => (
	<p
		className="supt-section__introduction"
		dangerouslySetInnerHTML={{
			__html: text,
		}}
	/>
);

/**
 * COMPONENT
 */
export const Section = (props: SectionProps) => props.children;

Section.Uptitle = Uptitle;
Section.Title = Title;
Section.Introduction = Introduction;
