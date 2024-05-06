import React from 'react';
import cx from 'classnames';
import { useMemo, useState } from '@wordpress/element';
import { select } from '@wordpress/data';
import { FormTokenField, Spinner } from '@wordpress/components';

import { POST_PT_NAME } from '#/constants';
import { useRestAPI } from '#/hooks';
import { WpPostRest, CoreEditorSelector } from '#/typings';
import { escapeHTML } from '#/utils';

import './styles.css';

// @ts-ignore
interface PostsSelectControlProps extends FormTokenField.Props {
	onChange: (tokens: Array<any>) => void;
	postType?: string;
	values?: Array<any>;
	label?: string;
}

const PostsSelectControl = ({
	onChange,
	postType = POST_PT_NAME,
	values,
	...rest
}: PostsSelectControlProps) => {
	const { getCurrentPostId, getCurrentPostType } = select(
		'core/editor'
	) as CoreEditorSelector;
	const [search, setSearch] = useState('');

	const selectedArgs = useMemo(
		() => ({
			per_page: 99,
			include: values,
			orderby: values?.length ? 'include' : undefined,
		}),
		[values]
	);

	const suggestionArgs = useMemo(
		() => ({
			search,
			excluded:
				getCurrentPostType() === postType ? [getCurrentPostId()] : [],
		}),
		[search, getCurrentPostType, getCurrentPostId, postType]
	);

	const { isLoading: isLoadingSelected, data: selectedPosts } = useRestAPI<
		WpPostRest[]
	>(postType, selectedArgs);

	const { data: suggestionPosts } = useRestAPI<WpPostRest[]>(
		postType,
		suggestionArgs
	);

	const suggestions = useMemo(() => {
		return suggestionPosts?.map(({ title }) => title.rendered) ?? [];
	}, [suggestionPosts]);

	const selectedTokens = useMemo(
		() =>
			values
				?.map(
					(value) =>
						selectedPosts?.find(({ id }) => id === value)?.title
							.rendered ?? ''
				)
				.filter(Boolean) ?? [],
		[selectedPosts, values]
	);

	return (
		<div
			className={cx('supt-posts-select-control', {
				'-is-loading': isLoadingSelected,
			})}
		>
			<div className="supt-posts-select-control__spinner">
				<Spinner />
			</div>
			<FormTokenField
				suggestions={suggestions}
				onInputChange={setSearch}
				displayTransform={escapeHTML}
				onChange={(tokens: Array<any>) => {
					onChange(
						tokens
							.map(
								(token) =>
									[...selectedPosts, ...suggestionPosts].find(
										({ title }) => title.rendered === token
									)?.id ?? null
							)
							.filter(Boolean)
					);
					setSearch('');
				}}
				value={selectedTokens}
				// @ts-ignore
				__experimentalExpandOnFocus={!!search.length}
				{...rest}
			/>
		</div>
	);
};

export default PostsSelectControl;
