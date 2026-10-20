import { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { useEffect, useRef } from 'react';

import Gdpr from '.';
import { categories } from './consent';
import { GdprBanner } from './GdprBanner';
import { GdprModal, type GdprModalHandle } from './GdprModal';

const meta = {
	title: 'Components/Molecules/Gdpr',
	component: Gdpr,
	parameters: {
		layout: 'fullscreen',
	},
} satisfies Meta<typeof Gdpr>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Banner only
 */
export const Banner: Story = {
	render: () => {
		return (
			<div
				style={{
					minHeight: '100vh',
					position: 'relative',
					backgroundColor: '#f5f5f5',
					padding: '2rem',
				}}
			>
				<div
					style={{
						maxWidth: '800px',
						margin: '0 auto',
						padding: '2rem',
						backgroundColor: '#fff',
						borderRadius: '8px',
					}}
				>
					<h1 style={{ marginBottom: '1rem' }}>Page Content</h1>
					<p>
						This is example page content. The cookie banner will
						appear fixed at the bottom-right corner of the viewport.
					</p>
				</div>
				<GdprBanner
					bannerDismissed={false}
					onAcceptClick={fn()}
					onRejectClick={fn()}
					onPersonalizeClick={fn()}
				/>
			</div>
		);
	},
};

const ModalStory = () => {
	const modalRef = useRef<GdprModalHandle>(null);

	// Auto-open the modal when rendered
	useEffect(() => {
		modalRef.current?.open();
	}, []);

	return (
		<div
			style={{
				minHeight: '100vh',
				position: 'relative',
				backgroundColor: '#f5f5f5',
			}}
		>
			<div
				style={{
					padding: '2rem',
					maxWidth: '800px',
					margin: '0 auto',
				}}
			>
				<h1>Page Content</h1>
				<p>
					This is example page content. The modal overlay appears on
					top.
				</p>
			</div>
			<GdprModal
				ref={modalRef}
				categories={categories.map((cat) => ({
					...cat,
					enabled: cat.id === 'necessary',
				}))}
				onCategoryChange={fn()}
				onModalSaved={fn()}
				onModalClosed={fn()}
			/>
		</div>
	);
};

/**
 * Modal only
 */
export const Modal: Story = {
	render: () => <ModalStory />,
};
