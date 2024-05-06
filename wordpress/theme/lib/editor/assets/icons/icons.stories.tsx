import React from 'react';
import { Meta, StoryObj } from '@storybook/react';

import {
	Section1ColCardsIcon,
	Section1ColListIcon,
	Section1ColMediaIcon,
	Section1ColTextCardsIcon,
	Section1ColTextIcon,
	Section2ColCardsIcon,
	Section2ColMediaIcon,
	Section2ColTextIcon,
	SectionFormIcon,
	SectionSliderCardsIcon,
	SectionSliderMediaIcon,
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
		<h2> Section </h2>
		<div className="grid">
			<div className="grid-item">
				<p>Section 1 col cards</p>
				<Section1ColCardsIcon />
			</div>
			<div className="grid-item">
				<p>Section 1 col list</p>
				<Section1ColListIcon />
			</div>
			<div className="grid-item">
				<p>Section 1 col media</p>
				<Section1ColMediaIcon />
			</div>
			<div className="grid-item">
				<p>Section 1 col text cards</p>
				<Section1ColTextCardsIcon />
			</div>
			<div className="grid-item">
				<p>Section 1 col text</p>
				<Section1ColTextIcon />
			</div>
			<div className="grid-item">
				<p>Section 2 col cards</p>
				<Section2ColCardsIcon />
			</div>
			<div className="grid-item">
				<p>Section 2 col media</p>
				<Section2ColMediaIcon />
			</div>
			<div className="grid-item">
				<p>Sectuib 2 col text</p>
				<Section2ColTextIcon />
			</div>
			<div className="grid-item">
				<p>Section Form</p>
				<SectionFormIcon />
			</div>
			<div className="grid-item">
				<p>Section slider cards</p>
				<SectionSliderCardsIcon />
			</div>
			<div className="grid-item">
				<p>Section slider media</p>
				<SectionSliderMediaIcon />
			</div>
		</div>
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
