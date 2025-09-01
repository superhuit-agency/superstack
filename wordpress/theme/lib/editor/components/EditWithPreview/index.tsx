import React from 'react';

import { PreviewBlockImage } from '../PreviewBlockImage';

export const EditWithPreview = ({ Edit, ...props }: any) =>
	props.attributes.isPreview ? (
		<PreviewBlockImage slug={props.name} />
	) : (
		<Edit {...props} />
	);
