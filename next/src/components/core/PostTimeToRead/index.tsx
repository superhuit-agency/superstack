import cx from 'classnames';

import './styles.css';

const formatCount = (n: number) => new Intl.NumberFormat().format(n);

function wordCountLabel(
	totalUnits: number,
	wordCountType: PostTimeToReadWordCountType | undefined
): string {
	const formatted = formatCount(totalUnits);
	if (
		wordCountType === 'characters_excluding_spaces' ||
		wordCountType === 'characters_including_spaces'
	) {
		return `${formatted} ${totalUnits === 1 ? 'character' : 'characters'}`;
	}
	return `${formatted} ${totalUnits === 1 ? 'word' : 'words'}`;
}

export default function PostTimeToRead({
	readingMinutes,
	readingMinutesMin,
	readingMinutesMax,
	textAlign,
	...props
}: PostTimeToReadProps) {
	const alignClass = {
		'-left': textAlign === 'left',
		'-center': textAlign === 'center',
		'-right': textAlign === 'right',
	};

	if (props.displayMode === 'words') {
		const totalUnits = props.totalUnits ?? 0;
		return (
			<div className={cx('wp-block-post-time-to-read', alignClass)}>
				{wordCountLabel(totalUnits, props.wordCountType)}
			</div>
		);
	}
	if (!props.displayAsRange) {
		return (
			<div className={cx('wp-block-post-time-to-read', alignClass)}>
				{readingMinutes} minutes
			</div>
		);
	}
	return (
		<div className={cx('wp-block-post-time-to-read', alignClass)}>
			{readingMinutesMin} - {readingMinutesMax} minutes
		</div>
	);
}
