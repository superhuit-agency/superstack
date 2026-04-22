import React from 'react';
import { Meta, StoryObj } from '@storybook/react';

import {
	H1Icon,
	H2Icon,
	H3Icon,
	H4Icon,
	H5Icon,
	H6Icon,
} from './index';
import './styles.css';

const Icons = () => (
	<section className="icons-story">
		<h2> Heading </h2>
		<div className="grid">
			<div className="grid-item">
				<p>H1 Icon</p>
				<H1Icon />
			</div>
			<div className="grid-item">
				<p>H2 Icon</p>
				<H2Icon />
			</div>
			<div className="grid-item">
				<p>H3 Icon</p>
				<H3Icon />
			</div>
			<div className="grid-item">
				<p>H4 Icon</p>
				<H4Icon />
			</div>
			<div className="grid-item">
				<p>H5 Icon</p>
				<H5Icon />
			</div>
			<div className="grid-item">
				<p>H6 Icon</p>
				<H6Icon />
			</div>
		</div>
	</section>
);

const meta = {
	title: 'Editor/Icons',
	component: Icons,
	parameters: {
		layout: 'centered',
	},
	args: {},
} satisfies Meta<typeof Icons>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {},
};
