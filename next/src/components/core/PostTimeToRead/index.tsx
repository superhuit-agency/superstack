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

	// No post to count
	if (props.totalUnits === undefined) return null;

	if (props.displayMode === 'words') {
		return (
			<div className={cx('wp-block-post-time-to-read', alignClass)}>
				{wordCountLabel(props.totalUnits, props.wordCountType)}
			</div>
		);
	}
	if (!props.displayAsRange) {
		return (
			<div className={cx('wp-block-post-time-to-read', alignClass)}>
				{readingMinutes} {readingMinutes === 1 ? 'minute' : 'minutes'}
			</div>
		);
	}
	return (
		<div className={cx('wp-block-post-time-to-read', alignClass)}>
			{readingMinutesMin} - {readingMinutesMax} minutes
		</div>
	);
}
