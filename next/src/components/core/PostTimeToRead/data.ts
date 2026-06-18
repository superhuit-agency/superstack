import { baseUriContext } from '@/hooks/use-base-uri';
import { gql } from '@/utils';

import {
	blockCorePostTimeToReadWordCount,
	type WordCountType,
} from './wordCount';

const DEFAULT_READING_SPEED = 189;

/** Mirrors `wp_get_word_count_type()` when not exposed via GraphQL yet. */
const DEFAULT_WORD_COUNT_TYPE: WordCountType = 'words';

type ContentBundle = {
	__typename?: string | null;
	rawContent?: string | null;
	/** Last resort: full HTML; prefer `<main>` slice to avoid counting the whole document. */
	renderedContent?: string | null;
	blocksJSON?: string | null;
};

type WpBlock = {
	name?: string;
	blockName?: string;
	innerHTML?: string;
	innerContent?: unknown[];
	innerBlocks?: WpBlock[];
};

const blockSlug = (b: WpBlock) => b.name ?? b.blockName ?? '';

/** FSE: main column body lives under `core/post-content` innerBlocks (not full-page HTML). */
const findPostContentInnerBlocks = (blocks: WpBlock[]): WpBlock[] | null => {
	for (const block of blocks) {
		if (blockSlug(block) === 'core/post-content') {
			return block.innerBlocks ?? [];
		}
		if (block.innerBlocks?.length) {
			const inner = findPostContentInnerBlocks(block.innerBlocks);
			if (inner !== null) return inner;
		}
	}
	return null;
};

const parseBlocksRoot = (parsed: unknown): WpBlock[] | null => {
	if (Array.isArray(parsed)) return parsed as WpBlock[];
	if (parsed && typeof parsed === 'object') {
		const inner = (parsed as { blocks?: unknown }).blocks;
		if (Array.isArray(inner)) return inner as WpBlock[];
	}
	return null;
};

/**
 * Prefer `<main>` so we do not count the whole `rendered` document (header/footer).
 * Greedy body: non-greedy `*?` can stop at the first `</main>` and return almost nothing (~few words).
 */
const scopeHtmlMain = (html: string): string => {
	const m = html.match(/<main\b[^>]*>([\s\S]*)<\/main>/i);
	return m?.[1]?.length ? m[1] : html;
};

/** When `blocksJSON` innerHTML is mostly markup/JSON, WP word-count stays tiny while `<main>` HTML is the real readable body. */
const RENDERED_FALLBACK_MIN_LEN = 2500;
const BLOCK_COUNT_LOW_MAX = 25;
const MAIN_COUNT_MIN_LEAD = 15;

const collectTextFromBlocks = (blocks: WpBlock[]): string => {
	const parts: string[] = [];
	const walk = (list: WpBlock[]) => {
		for (const block of list) {
			if (typeof block.innerHTML === 'string' && block.innerHTML.trim()) {
				parts.push(block.innerHTML);
			}
			if (Array.isArray(block.innerContent)) {
				for (const chunk of block.innerContent) {
					if (typeof chunk === 'string' && chunk.trim())
						parts.push(chunk);
				}
			}
			if (block.innerBlocks?.length) walk(block.innerBlocks);
		}
	};
	walk(blocks);
	return parts.join('\n');
};

const textFromBlocksJson = (
	blocksJSON: string | null | undefined,
	nodeTypename: string | null | undefined
): string => {
	if (typeof blocksJSON !== 'string' || !blocksJSON.trim()) {
		return '';
	}
	let parsed: unknown;
	try {
		parsed = JSON.parse(blocksJSON);
	} catch {
		return '';
	}
	const blocks = parseBlocksRoot(parsed);
	if (!blocks?.length) return '';

	const isPost = nodeTypename === 'Post';
	if (isPost) {
		return collectTextFromBlocks(blocks);
	}

	const shell = findPostContentInnerBlocks(blocks);
	if (shell !== null && shell.length > 0) {
		const fromShell = collectTextFromBlocks(shell);
		if (fromShell.trim().length > 0) return fromShell;
	}
	// Empty `core/post-content` in API (injected later in Next) or no shell: use full tree.
	return collectTextFromBlocks(blocks);
};

/**
 * Order: RAW (`post_content` / `get_the_content`) → `blocksJSON` innerHTML → `<main>` slice of RENDERED.
 * If blocks yield very few *words* but RENDERED is large, prefer `<main>` (blocks markup can under-count vs HTML body).
 */
const pickTextForWordCount = (
	bundle: ContentBundle | null | undefined,
	wordCountType: WordCountType
): string => {
	const raw = typeof bundle?.rawContent === 'string' ? bundle.rawContent : '';
	if (raw.length > 0) return raw;

	const fromBlocks = textFromBlocksJson(
		bundle?.blocksJSON,
		bundle?.__typename ?? null
	);
	const rendered =
		typeof bundle?.renderedContent === 'string'
			? bundle.renderedContent
			: '';

	if (
		fromBlocks.trim().length > 0 &&
		rendered.length >= RENDERED_FALLBACK_MIN_LEN
	) {
		const wcBlocks = blockCorePostTimeToReadWordCount(
			fromBlocks,
			wordCountType
		);
		const scoped = scopeHtmlMain(rendered);
		const wcMain = blockCorePostTimeToReadWordCount(scoped, wordCountType);
		if (
			wcBlocks <= BLOCK_COUNT_LOW_MAX &&
			wcMain >= wcBlocks + MAIN_COUNT_MIN_LEAD
		) {
			return scoped;
		}
		return fromBlocks;
	}

	if (fromBlocks.trim().length > 0) {
		return fromBlocks;
	}

	if (rendered.length > 0) {
		const scoped = scopeHtmlMain(rendered);
		if (scoped.length > 0) {
			return scoped;
		}
	}

	return '';
};

const normalizeDisplayMode = (
	value: PostTimeToReadAttributes['displayMode']
): 'time' | 'words' => (value === 'words' ? 'words' : 'time');

const normalizeReadingSpeed = (value: unknown): number => {
	const n =
		typeof value === 'number' ? value : Number.parseInt(String(value), 10);
	if (!Number.isFinite(n) || n < 1) return DEFAULT_READING_SPEED;
	return Math.floor(n);
};

export const getData = async (
	fetcher: FetchApiFuncType,
	attrs: PostTimeToReadAttributes | null = null
) => {
	const wordCountType: WordCountType = DEFAULT_WORD_COUNT_TYPE;
	const displayMode = normalizeDisplayMode(attrs?.displayMode);
	const averageReadingSpeed = normalizeReadingSpeed(
		attrs?.averageReadingSpeed
	);

	let bundle: ContentBundle | null = null;

	if (attrs?.postId) {
		const byIdQuery = gql`
			query PostTimeToReadByPostId($postId: ID!) {
				post(id: $postId) {
					__typename
					rawContent: content(format: RAW)
					renderedContent: content(format: RENDERED)
					blocksJSON
				}
			}
		`;
		const byIdData = await fetcher(byIdQuery, {
			variables: { postId: String(attrs.postId) },
		});
		bundle = byIdData?.post ?? null;
	} else {
		const byUriQuery = gql`
			query PostTimeToReadByUri($uri: String!) {
				nodeByUri(uri: $uri) {
					__typename
					... on Post {
						rawContent: content(format: RAW)
						renderedContent: content(format: RENDERED)
						blocksJSON
					}
					... on Page {
						rawContent: content(format: RAW)
						renderedContent: content(format: RENDERED)
						blocksJSON
					}
				}
			}
		`;
		const uri = baseUriContext();
		const byUriData = await fetcher(byUriQuery, { variables: { uri } });
		bundle = byUriData?.nodeByUri ?? null;
	}

	const textSource = pickTextForWordCount(bundle, wordCountType);

	const totalUnits = blockCorePostTimeToReadWordCount(
		textSource,
		wordCountType
	);

	const base: Pick<PostTimeToReadAttributes, 'wordCountType' | 'totalUnits'> =
		{
			wordCountType,
			totalUnits,
		};

	if (displayMode !== 'time') {
		return base;
	}

	if (attrs?.displayAsRange) {
		const minMinutes = Math.max(
			1,
			Math.round((totalUnits / averageReadingSpeed) * 0.8)
		);
		let maxMinutes = Math.max(
			1,
			Math.round((totalUnits / averageReadingSpeed) * 1.2)
		);
		if (minMinutes === maxMinutes) {
			maxMinutes = minMinutes + 1;
		}
		return {
			...base,
			readingMinutesMin: minMinutes,
			readingMinutesMax: maxMinutes,
		};
	}

	return {
		...base,
		readingMinutes: Math.max(
			1,
			Math.round(totalUnits / averageReadingSpeed)
		),
	};
};
