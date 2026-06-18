type PostTimeToReadWordCountType =
	| 'words'
	| 'characters_excluding_spaces'
	| 'characters_including_spaces';

interface PostTimeToReadAttributes extends BlockAttributes {
	postId?: number;
	averageReadingSpeed?: number;
	displayMode?: 'time' | 'words';
	displayAsRange?: boolean;
	textAlign?: string;
	/** Site setting `wp_get_word_count_type()`; merged by getData (default `words`). */
	wordCountType?: PostTimeToReadWordCountType;
	/** Count from `block_core_post_time_to_read_word_count` using `wordCountType`. */
	totalUnits?: number;
	readingMinutes?: number;
	readingMinutesMin?: number;
	readingMinutesMax?: number;
}

type PostTimeToReadProps = PostTimeToReadAttributes;
