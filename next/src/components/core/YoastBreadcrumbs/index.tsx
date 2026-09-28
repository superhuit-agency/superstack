import block from './block.json';

import './styles.css';

export default function YoastBreadcrumbs({
	breadcrumbs = [],
}: YoastBreadcrumbsProps) {
	if (!breadcrumbs.length) return null;

	return (
		<nav className="yoast-breadcrumbs" aria-label="Breadcrumb">
			<ol>
				{breadcrumbs.map(({ text, url }, i) => {
					const isLast = i === breadcrumbs.length - 1;

					return (
						<li key={`${url}-${i}`}>
							{isLast || !url ? (
								<span
									aria-current="page"
									dangerouslySetInnerHTML={{ __html: text }}
								/>
							) : (
								<a
									href={url}
									dangerouslySetInnerHTML={{ __html: text }}
								/>
							)}
							{isLast ? null : (
								<span className="-separator" aria-hidden="true">
									/
								</span>
							)}
						</li>
					);
				})}
			</ol>
		</nav>
	);
}

YoastBreadcrumbs.slug = block.slug;
YoastBreadcrumbs.title = block.title;
