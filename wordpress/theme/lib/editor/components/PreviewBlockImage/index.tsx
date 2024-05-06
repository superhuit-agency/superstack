import React from 'react';
import { useMemo } from '@wordpress/element';

declare global {
	interface Window {
		supt: any;
	}
}

type PreviewBlockImageType = {
	slug: string;
};

export const PreviewBlockImage = ({ slug }: PreviewBlockImageType) => {
	// Clean slug to be kebab-case
	const filename = useMemo(
		() =>
			slug
				.replace(/[\/_\\]/, '-')
				.replace(/([A-Z])([A-Z])/, '$1-$2')
				.replace(/-{2,}/, '-')
				.toLowerCase(),
		[slug]
	);
	return (
		<picture>
			<img
				src={`${window.supt.theme_uri}/lib/editor/blocks-preview/${filename}.jpg`}
				style={{ width: '100%' }}
				alt='Preview block image'
			/>
		</picture>
	);
};
