import cx from 'classnames';
import Link from 'next/link';

export default function TermName({
	level = 0,
	isLink = false,
	content,
	uri,
	textAlign,
	className,
}: TermNameProps) {
	if (!content) return null;

	const HTag = (level === 0 ? 'p' : `h${level}`) as
		| 'p'
		| 'h1'
		| 'h2'
		| 'h3'
		| 'h4'
		| 'h5'
		| 'h6';

	return (
		<HTag
			className={cx(
				'wp-block-term-name',
				// Titles are styled through `wp-block-heading` in this theme.
				{ 'wp-block-heading': level > 0 },
				className,
				{
					'-center': textAlign === 'center',
					'-right': textAlign === 'right',
					'-left': textAlign === 'left',
				}
			)}
		>
			{isLink && uri ? <Link href={uri}>{content}</Link> : content}
		</HTag>
	);
}
