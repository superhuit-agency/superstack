import Template from '@/components/global/Template';

import {
	enrichTemplateBlocks,
	getNotFoundBreadcrumbs,
	getTemplateBlocks,
	injectBreadcrumbs,
} from '@/lib';

export default async function NotFound() {
	const [templateBlocks, breadcrumbs] = await Promise.all([
		enrichTemplateBlocks(getTemplateBlocks('404')),
		getNotFoundBreadcrumbs(),
	]);

	const blocks = injectBreadcrumbs(
		templateBlocks,
		breadcrumbs
	) as BlockPropsType[];

	return <Template node={{ blocks }} />;
}
