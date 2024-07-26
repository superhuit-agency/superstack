import { FC } from 'react';
// internal imports
import block from './block.json';

// styles
import './styles.css';

export const FormSectionBreaker: FC<FormSectionBreakerProps> & BlockConfigs = ({
	title,
	...rest
}) => {
	return (
		<div className="supt-form-section-breaker" {...rest}>
			<h4 className="supt-form-section-breaker__title">{title}</h4>
		</div>
	);
};

FormSectionBreaker.slug = block.slug;
FormSectionBreaker.title = block.title;
