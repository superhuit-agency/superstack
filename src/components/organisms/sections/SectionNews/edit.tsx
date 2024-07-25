import { useMemo } from 'react';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, Spinner, TextControl } from '@wordpress/components';
import { _x } from '@wordpress/i18n';

import { PreviewBlockImage, SectionEdit, ButtonEdit } from '#/components';
import { useGraphQlApi } from '#/hooks';

import { CardNews, CardNewsProps } from '@/components/molecules/cards/CardNews';
import EditNewsControls from './EditNewsControls';

// Data
import { SectionNewsProps } from '.';
import block from './block.json';
import { getData } from './data';

// styles
import './styles.css';
import './styles.edit.css';

declare global {
	interface Window {
		pll_block_editor_plugin_settings: any;
	}
}

/**
 * COMPONENT EDIT
 */
const Edit = (props: WpBlockEditProps<SectionNewsProps>) => {
	const slug = props.name;

	const {
		uptitle,
		title,
		introduction,
		queryVars = {},
		postLinkLabel,
		seeAllLink,
	} = props.attributes;

	const variables = useMemo(() => ({ queryVars }), [queryVars]);

	const {
		isLoading,
		data: { posts },
	} = useGraphQlApi(getData, variables);

	// For block preview
	if (slug && props.attributes.isPreview)
		return <PreviewBlockImage slug={slug} />;

	return (
		<>
			<InspectorControls>
				{/* Controls */}
				<EditNewsControls
					vars={queryVars}
					onChange={(queryVars: object) =>
						props.setAttributes({ queryVars })
					}
				/>

				<PanelBody title={_x('Information', 'Panel title', 'supt')}>
					<TextControl
						label={_x(
							'Article link label',
							'Article link label',
							'supt'
						)}
						value={props.attributes.postLinkLabel || ''}
						onChange={(postLinkLabel: string) =>
							props.setAttributes({ postLinkLabel })
						}
					/>
				</PanelBody>
			</InspectorControls>

			<section className="supt-section supt-section-news">
				<div className="supt-section__inner">
					<div className="supt-section__headline">
						<SectionEdit.Uptitle
							attribute={uptitle || ''}
							onChange={(uptitle: string) =>
								props.setAttributes({ uptitle })
							}
						/>
						<SectionEdit.Title
							attribute={title || ''}
							onChange={(title: string) =>
								props.setAttributes({ title })
							}
						/>
						<SectionEdit.Introduction
							attribute={introduction || ''}
							onChange={(introduction: string) =>
								props.setAttributes({ introduction })
							}
						/>
					</div>
					<div className="supt-section__content">
						{isLoading || !posts?.length ? (
							<p className="supt-section-news__placeholder">
								{isLoading ? (
									<Spinner />
								) : (
									_x(
										'Oups, looks like there is no news to show.',
										'Section news edit',
										'supt'
									)
								)}
							</p>
						) : (
							<div className="supt-section__list">
								{posts.map(
									(post: CardNewsProps, index: number) => (
										<CardNews
											key={index}
											linkLabel={postLinkLabel}
											{...post}
										/>
									)
								)}
							</div>
						)}

						<div className="supt-section__link-wrapper">
							<ButtonEdit
								attrs={seeAllLink}
								onChange={(attrs: object) =>
									props.setAttributes({
										seeAllLink: attrs,
									})
								}
								placeholder={_x(
									'See all news',
									'Button Placeholder',
									'supt'
								)}
								isSelected={props.isSelected}
								toolbarPosition="left"
								wrapperClass="supt-section__link-inner"
								rootClass="supt-section__link"
								linkSettings={{ settings: [] }}
								inBlockControls={false}
							/>
						</div>
					</div>
				</div>
			</section>
		</>
	);
};

/**
 * WORDPRESS BLOCK
 */
export const SectionNewsBlock: WpBlockType<SectionNewsProps> = {
	slug: block.slug,
	settings: {
		title: block.title,
		description: _x('', 'Block description', 'supt'),
		category: 'spck-content',
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="48px"
				height="16px"
				viewBox="0 0 48 16"
			>
				<g transform="translate(0.000000, -15.000000)">
					<path d="M14,15 L14,31 L0,31 L0,15 L14,15 Z M31,15 L31,31 L17,31 L17,15 L31,15 Z M48,15 L48,31 L34,31 L34,15 L48,15 Z M13,16 L1,16 L1,30 L13,30 L13,16 Z M30,16 L18,16 L18,30 L30,30 L30,16 Z M47,16 L35,16 L35,30 L47,30 L47,16 Z M6,27 L6,28 L2,28 L2,27 L6,27 Z M23,27 L23,28 L19,28 L19,27 L23,27 Z M40,27 L40,28 L36,28 L36,27 L40,27 Z M12,24 L12,25 L2,25 L2,24 L12,24 Z M29,24 L29,25 L19,25 L19,24 L29,24 Z M46,24 L46,25 L36,25 L36,24 L46,24 Z M12,21 L12,22 L2,22 L2,21 L12,21 Z M29,21 L29,22 L19,22 L19,21 L29,21 Z M46,21 L46,22 L36,22 L36,21 L46,21 Z M8,18 L8,19 L2,19 L2,18 L8,18 Z M25,18 L25,19 L19,19 L19,18 L25,18 Z M42,18 L42,19 L36,19 L36,18 L42,18 Z" />
				</g>
			</svg>
		),
		postTypes: ['page'],
		supports: {
			anchor: true,
		},
		attributes: {
			anchor: {
				type: 'string',
			},
			title: {
				type: 'string',
			},
			uptitle: {
				type: 'string',
			},
			introduction: {
				type: 'string',
			},
			queryVars: {
				type: 'object',
				default: {},
			},
			postLinkLabel: {
				type: 'string',
				default: 'Read',
			},
			seeAllLink: {
				type: 'object',
				default: {
					title: 'See all news',
					href: '',
				},
			},
			isPreview: {
				type: 'boolean',
				default: false,
			},
			posts: {
				type: 'array',
				default: [],
			},
		},
		example: {
			viewportWidth: 1280,
			attributes: {
				isPreview: true,
			},
		} as any,
		edit: Edit,
		save: () => null,
	},
};
