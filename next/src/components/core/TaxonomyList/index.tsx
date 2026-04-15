import Link from 'next/link';

import { getTermKey, getTermParentKey, toTree } from './helper';
import './styles.css';

const renderNestedTerms = (
  byParent: Map<string | null, TaxonomyTerm[]>,
  parentKey: string | null,
  showPostCounts: boolean,
) => {
  const terms = byParent.get(parentKey) ?? [];
  if (!terms.length) return null;

  return (
    <ul>
      {terms.map((term) => {
        const termKey = getTermKey(term);
        return (
          <li key={termKey}>
            <Link href={term.uri ?? `/`}>{term.name}</Link>
            {showPostCounts && typeof term.count === 'number'
              ? ` (${term.count})`
              : ''}
            {renderNestedTerms(byParent, termKey, showPostCounts)}
          </li>
        );
      })}
    </ul>
  );
};

export default async function TaxonomyList({
  taxonomy,
  showPostCounts,
  showHierarchy,
  showOnlyTopLevel,
  displayAsDropdown,
  label,
  showLabel,
  data,
}: TaxonomyListProps) {
  const termsBeforeLevelFilter: TaxonomyTerm[] = data?.terms?.nodes ?? [];
  const terms = showOnlyTopLevel
    ? termsBeforeLevelFilter.filter((term) => !getTermParentKey(term))
    : termsBeforeLevelFilter;

  if (!terms.length) return null;

  if (displayAsDropdown) {
    const labelText = label || taxonomy.replace(/_/g, ' ');

    return (
      <form
        method="GET"
        className={`wp-block-categories-dropdown wp-block-categories-taxonomy-${taxonomy}`}
      >
        <label className={!showLabel ? 'screen-reader-text' : undefined}>
          {labelText}
          <select name={taxonomy} defaultValue="">
            <option value="">Select {labelText}</option>
            {terms.map((term) => (
              <option key={getTermKey(term)} value={term.slug}>
                {term.name}
                {showPostCounts && typeof term.count === 'number'
                  ? ` (${term.count})`
                  : ''}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Go</button>
      </form>
    );
  }

  if (showHierarchy) {
    const byParent = toTree(terms);
    return (
      <div
        className={`wp-block-categories-list wp-block-categories-taxonomy-${taxonomy}`}
      >
        {renderNestedTerms(byParent, null, !!showPostCounts)}
      </div>
    );
  }

  return (
    <ul
      className={`wp-block-categories-list wp-block-categories-taxonomy-${taxonomy}`}
    >
      {terms.map((term) => (
        <li key={getTermKey(term)}>
          <Link href={term.uri ?? `/`}>{term.name}</Link>
          {showPostCounts && typeof term.count === 'number'
            ? ` (${term.count})`
            : ''}
        </li>
      ))}
    </ul>
  );
}
