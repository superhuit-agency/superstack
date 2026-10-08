import Template from '@/components/global/Template';

import { langContext } from '@/hooks/use-lang';
import {
	enrichTemplateBlocks,
	getNotFoundBreadcrumbs,
	getTemplateBlocks,
	injectBreadcrumbs,
} from '@/lib';

export default async function NotFound() {
	const lang = langContext();

	const [templateBlocks, breadcrumbs] = await Promise.all([
		getTemplateBlocks('404', lang).then((blocks) =>
			enrichTemplateBlocks(blocks, { lang })
		),
		getNotFoundBreadcrumbs(lang),
	]);

	const blocks = injectBreadcrumbs(
		templateBlocks,
		breadcrumbs
	) as BlockPropsType[];

	return <Template node={{ blocks }} />;
}
