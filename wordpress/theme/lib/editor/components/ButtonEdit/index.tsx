import React from 'react';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';

import { Icon } from '@wordpress/components';
import { BlockControls, PlainText } from '@wordpress/block-editor';
import { useState, useCallback, useEffect } from '@wordpress/element';

import {
	LinkControlValueProps,
	UrlPickerChangeParams,
} from '../UrlPicker/typings';
import { UrlPicker } from '..';
import { ButtonProps } from '@/typings';

type ButtonEditProps = {
	attrs: ButtonProps;
	isSelected?: boolean;
	wrapperClass?: string;
	rootClass?: string;
	onChange: Function;
	linkSettings?: object;
	placeholder?: string;
	toolbarPosition?: 'left' | 'right';
	minCols?: number;
	maxCols?: number;
	inBlockControls?: boolean;
};

export default function ButtonEdit({
	attrs,
	onChange,
	linkSettings,
	wrapperClass,
	rootClass,
	isSelected,
	placeholder = '',
	toolbarPosition,
	inBlockControls = true,
}: ButtonEditProps) {
	const [isInputFocused, setIsInputFocused] = useState(false);
	const [urlPickerAttrs, setUrlPickerAttrs] = useState<UrlPickerChangeParams>(
		{}
	);

	const onTitleChange = useCallback(
		(title: string) => {
			onChange({ ...attrs, title });
		},
		[attrs, onChange]
	);

	useEffect(() => {
		setUrlPickerAttrs({
			url: attrs?.href ?? '',
			title: attrs?.title ?? '',
			opensInNewTab: attrs?.target === '_blank',
		});
	}, [attrs]);

	const onURLPickerChange = useCallback(
		({ url, title, opensInNewTab }: LinkControlValueProps) => {
			const newAttrs = {
				title: isEmpty(attrs.title) ? title : attrs.title,
				href: url,
				target: opensInNewTab ? '_blank' : undefined,
			};

			if (!isEqual(attrs, newAttrs)) onChange(newAttrs);
		},
		[onChange, attrs]
	);

	const Picker = () => (
		<UrlPicker
			value={urlPickerAttrs}
			onChange={onURLPickerChange}
			isSelected={isSelected !== undefined ? isSelected : false}
			enableKbShortcut={isInputFocused}
			toolbarPosition={toolbarPosition}
			linkControlProps={{ settings: linkSettings }}
		/>
	);

	return (
		<>
			{inBlockControls ? (
				<BlockControls controls={[]}>
					<Picker />
				</BlockControls>
			) : null}
			<div className={wrapperClass}>
				<span className={rootClass}>
					<span className="supt-button__inner">
						<PlainText
							value={attrs.title ?? ''}
							onChange={onTitleChange}
							onFocus={() => setIsInputFocused(true)}
							onBlur={() => setIsInputFocused(false)}
							placeholder={placeholder}
						/>
					</span>
				</span>
				{attrs.target === '_blank' ? <Icon icon="external" /> : null}
				{!inBlockControls ? <Picker /> : null}
			</div>
		</>
	);
}
