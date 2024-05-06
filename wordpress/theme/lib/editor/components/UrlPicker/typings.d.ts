import { HtmlProps } from 'next/dist/shared/lib/html-context.shared-runtime';

export interface LinkControlValueProps {
	title?: string;
	url?: string;
	opensInNewTab?: boolean;
}

interface UrlPickerProps {
	value: LinkControlValueProps;
	onChange: Function;
	isSelected: boolean;
	enableKbShortcut?: boolean;
	toolbarPosition?: 'left' | 'right';
	toolbarBtnProps?: any;
	linkControlProps?: any;
}

export interface UrlPickerChangeParams extends LinkControlValueProps {
	id?: number;
	type?: string;
	kind?: string;
}

export interface LinkAttributes {
	title?: string;
	href?: string;
	target?: Pick<HtmlProps<HTMLAnchorElement>, 'target'>;
	id?: number;
	type?: string;
	kind?: string;
}
