import { FC } from 'react';

import {
	Button,
	Buttons,
	Checkbox,
	Form,
	FormSectionBreaker,
	Heading,
	Image,
	InputCheckbox,
	InputEmail,
	InputFile,
	InputRadio,
	InputSelect,
	InputText,
	InputTextarea,
	List,
	ListItem,
	Media,
	Paragraph,
	Radio,
	SectionNews,
	Video,
	// -- GENERATOR IMPORT SLOT --
} from '.';
import { type BlocksType } from './global/Blocks';

export const rootBlocksList: BlocksType = {
	'core/heading': Heading,
	'core/list': List,
	'core/list-item': ListItem,
	'core/paragraph': Paragraph,

	'core/button': Button,
	'core/buttons': Buttons,

	'supt/checkbox': Checkbox,
	'supt/form': Form,
	'supt/form-section-breaker': FormSectionBreaker,
	'supt/image': Image,
	'supt/input-checkbox': InputCheckbox,
	'supt/input-email': InputEmail,
	'supt/input-file': InputFile,
	'supt/input-radio': InputRadio,
	'supt/input-select': InputSelect,
	'supt/input-text': InputText,
	'supt/input-textarea': InputTextarea,
	'supt/media': Media,
	'supt/radio': Radio,
	'supt/section-news': SectionNews,
	'supt/video': Video,
	// -- GENERATOR BLOCK SLOT --
};
