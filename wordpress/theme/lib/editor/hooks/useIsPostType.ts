import { useSelect } from '@wordpress/data';
import { CoreEditorSelector } from '#/typings';

export function useIsPostType(postType: string | Array<string>) {
	return useSelect((select): boolean => {
		const { getCurrentPostType } = select(
			'core/editor'
		) as CoreEditorSelector;
		const currentPostType: string = getCurrentPostType();

		return Array.isArray(postType)
			? postType.includes(currentPostType ?? '')
			: postType === currentPostType;
	}, []);
}
