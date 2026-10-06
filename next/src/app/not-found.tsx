import Template from '@/components/global/Template';

import {
	enrichTemplateBlocks,
	getNotFoundBreadcrumbs,
	getTemplateBlocks,
	injectBreadcrumbs,
} from '@/lib';

export default async function NotFound() {
	const [templateBlocks, breadcrumbs] = await Promise.all([
		getTemplateBlocks('404').then((blocks) => enrichTemplateBlocks(blocks)),
		// Breadcrumbs are a detail of a 404: a failed read leaves them out
		// rather than failing the page
		getNotFoundBreadcrumbs().catch(() => []),
	]);

	const blocks = injectBreadcrumbs(
		templateBlocks,
		breadcrumbs
	) as BlockPropsType[];

	return <Template node={{ blocks }} />;
}
