import { Meta, StoryObj } from '@storybook/react';

import { Gdpr } from '.';
import { LocaleProvider } from '../../../contexts/locale-context';

const meta = {
	title: 'Components/Molecules/Gdpr',
	component: Gdpr,
	argTypes: {},
	parameters: {
		layout: 'fullscreen',
	},
	decorators: [
		(Story) => {
			const locale = 'en';
			const dictionary = require(`@/i18n/dictionaries/${locale}.json`);
			return (
				<LocaleProvider locale={locale} dictionary={dictionary}>
					<Story />
				</LocaleProvider>
			);
		},
	],
} satisfies Meta<typeof Gdpr>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		bannerDismissed: false,
	},
};
