/**
 * Port of WordPress `block_core_post_time_to_read_word_count` (6.9+).
 * Keeps counting rules aligned with the PHP block for editor/frontend parity.
 */
export type WordCountType =
  | 'words'
  | 'characters_excluding_spaces'
  | 'characters_including_spaces';

export function blockCorePostTimeToReadWordCount(
  text: string,
  type: string,
): number {
  const htmlRegexp = /<\/?[a-z][^>]*?>/gi;
  const htmlCommentRegexp = /<!--[\s\S]*?-->/g;
  const spaceRegexp = /&nbsp;|&#160;/gi;
  const htmlEntityRegexp = /&\S+?;/g;
  const connectorRegexp = /--|\u{2014}/gu;
  const removeRegexp =
    /[\u{0021}-\u{0040}\u{005B}-\u{0060}\u{007B}-\u{007E}\u{0080}-\u{00BF}\u{00D7}\u{00F7}\u{2000}-\u{2BFF}\u{2E00}-\u{2E7F}]/gu;
  const astralRegexp = /[\u{010000}-\u{10FFFF}]/gu;
  const wordsRegexp = /\S\s+/gu;
  const charactersExcludingSpacesRegexp = /\S/gu;
  const charactersIncludingSpacesRegexp =
    /[^\f\n\r\t\v\u{00AD}\u{2028}\u{2029}]/gu;

  if (text.trim() === '') {
    return 0;
  }

  const countType: WordCountType =
    type === 'characters_excluding_spaces' || type === 'characters_including_spaces'
      ? type
      : 'words';

  let t = `${text}\n`;

  t = t.replace(htmlRegexp, '\n');
  t = t.replace(htmlCommentRegexp, '');
  t = t.replace(spaceRegexp, ' ');

  if (countType === 'words') {
    t = t.replace(htmlEntityRegexp, '');
    t = t.replace(connectorRegexp, ' ');
    t = t.replace(removeRegexp, '');
    return (t.match(wordsRegexp) ?? []).length;
  }

  t = t.replace(htmlEntityRegexp, 'a');
  t = t.replace(astralRegexp, 'a');

  const pattern =
    countType === 'characters_excluding_spaces'
      ? charactersExcludingSpacesRegexp
      : charactersIncludingSpacesRegexp;

  return (t.match(pattern) ?? []).length;
}
