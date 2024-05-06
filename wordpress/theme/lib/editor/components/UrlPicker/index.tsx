import React from 'react';
import cx from 'classnames';

import { _x } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import {
	KeyboardShortcuts,
	ToolbarButton,
	// @ts-ignore
	ToolbarGroup,
	Popover,
	Button,
} from '@wordpress/components';
// @ts-ignore
import { __experimentalLinkControl as LinkControl } from '@wordpress/block-editor';
import { rawShortcut, displayShortcut } from '@wordpress/keycodes';

import { UrlPickerProps } from './typings';


export const UrlPicker = ({
	value,
	onChange,
	isSelected,
	enableKbShortcut,
	toolbarPosition = 'left',
	toolbarBtnProps = {},
	linkControlProps = {},
}: UrlPickerProps) => {
	const [isURLPickerOpen, setIsURLPickerOpen] = useState(false);

	const openLinkControl = () => {
		setIsURLPickerOpen(true);
	};

	const toolbarClasses = cx({
		'is-visible': isSelected,
		[`is-position-${toolbarPosition}`]: true,
	});

	return (
		<>
			<ToolbarGroup className={toolbarClasses}>
				<ToolbarButton
					name="link"
					icon="admin-links"
					title={_x('Link', 'UrlPicker toolbar button title', 'supt')}
					shortcut={displayShortcut.primary('k')}
					onClick={openLinkControl}
					{...toolbarBtnProps}
				/>
			</ToolbarGroup>
			{enableKbShortcut && (
				<KeyboardShortcuts
					bindGlobal
					shortcuts={{
						[rawShortcut.primary('k')]: openLinkControl,
					}}
				/>
			)}
			{isURLPickerOpen && (
				<Popover
					position="bottom center"
					onClose={() => setIsURLPickerOpen(false)}
				>
					<LinkControl
						value={value}
						onChange={onChange}
						{...linkControlProps}
					/>
					{value.url ? (
						<Button
							style={{ margin: '5px 16px 16px' }}
							isDestructive
							variant="link"
							onClick={() => {
								onChange({
									url: undefined,
									opensInNewTab: undefined,
								});

								setIsURLPickerOpen(false);
							}}
						>
							{_x('Remove link', 'Link', 'supt')}
						</Button>
					) : null}
				</Popover>
			)}
		</>
	);
};
