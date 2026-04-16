import { baseUriContext } from '@/hooks/use-base-uri';
import { gql } from '@/utils';

import { parsePostDateToUtcMs } from './format-post-date';

/** Serialized `datetime` is ignored when bindings pin the value to `date` / `published` / `modified`. */
const metadataOverridesPresetDatetime = (attrs: PostDateAttributes | null) => {
  const field = attrs?.metadata?.bindings?.datetime?.args?.field;
  return field === 'modified' || field === 'date' || field === 'published';
};

/** GraphQL field to read (`date` = publish, `modified` = last modified). */
const resolveGraphqlField = (
  attrs: PostDateAttributes | null,
): 'date' | 'modified' => {
  const boundField = attrs?.metadata?.bindings?.datetime?.args?.field;
  if (boundField === 'modified') return 'modified';
  if (boundField === 'date' || boundField === 'published') return 'date';
  if (attrs?.displayType === 'modified') return 'modified';
  return 'date';
};

const queryPostDateGeneral = gql`
  query PostDateGeneralSettings {
    generalSettings {
      dateFormat
    }
  }
`;

const queryPostDate = gql`
  query PostDateData($uri: String!) {
    generalSettings {
      dateFormat
    }
    nodeByUri(uri: $uri) {
      __typename
      ... on Post {
        date
        modified
        uri
      }
      ... on Page {
        date
        modified
        uri
      }
    }
  }
`;

const resolveDisplayFormat = (
  formatAttr: string | undefined,
  siteDateFormat: string | null,
): { isHumanDiff: boolean; phpDatePattern: string } => {
  if (formatAttr === 'human-diff') {
    return { isHumanDiff: true, phpDatePattern: '' };
  }

  const explicit =
    typeof formatAttr === 'string' &&
    formatAttr.trim() &&
    formatAttr !== 'human-diff'
      ? formatAttr.trim()
      : '';
  const pattern =
    explicit ||
    (typeof siteDateFormat === 'string' && siteDateFormat.trim()
      ? siteDateFormat.trim()
      : 'Y-m-d');

  return { isHumanDiff: false, phpDatePattern: pattern };
};

const fetchGeneralSettings = async (fetcher: FetchApiFuncType) => {
  const data = await fetcher(queryPostDateGeneral);
  return {
    dateFormat:
      typeof data?.generalSettings?.dateFormat === 'string'
        ? data.generalSettings.dateFormat
        : null,
  };
};

export const getData = async (
  fetcher: FetchApiFuncType,
  attrs: PostDateAttributes | null = null,
) => {
  const formatAttr = attrs?.format;
  const uriRaw = baseUriContext();
  const baseUri =
    typeof uriRaw === 'string' && uriRaw.trim() ? uriRaw.trim() : '';

  if (typeof attrs?.datetime === 'string' && !attrs.datetime.trim()) {
    return { renderEmpty: true as const };
  }

  const presetDatetime =
    typeof attrs?.datetime === 'string' && attrs.datetime.trim()
      ? attrs.datetime.trim()
      : '';

  const fetchFromNode =
    metadataOverridesPresetDatetime(attrs) || !presetDatetime;

  if (!fetchFromNode && presetDatetime) {
    if (parsePostDateToUtcMs(presetDatetime) === null) {
      return { renderEmpty: true as const };
    }

    if (formatAttr === 'human-diff') {
      return {
        renderEmpty: false as const,
        machineDatetime: presetDatetime,
        permalink: baseUri,
        showModifiedClass: resolveGraphqlField(attrs) === 'modified',
        isHumanDiff: true as const,
        phpDatePattern: '',
      };
    }

    const gs = await fetchGeneralSettings(fetcher);
    const { isHumanDiff, phpDatePattern } = resolveDisplayFormat(
      formatAttr,
      gs.dateFormat,
    );

    return {
      renderEmpty: false as const,
      machineDatetime: presetDatetime,
      permalink: baseUri,
      showModifiedClass: resolveGraphqlField(attrs) === 'modified',
      isHumanDiff,
      phpDatePattern,
    };
  }

  if (!baseUri) {
    return { renderEmpty: true as const };
  }

  const data = await fetcher(queryPostDate, { variables: { uri: baseUri } });
  const node = data?.nodeByUri as
    | { date?: string; modified?: string; uri?: string }
    | null
    | undefined;

  const field = resolveGraphqlField(attrs);
  const raw =
    field === 'modified'
      ? typeof node?.modified === 'string'
        ? node.modified
        : ''
      : typeof node?.date === 'string'
        ? node.date
        : '';

  const machineDatetime = raw.trim();
  if (!machineDatetime) {
    return { renderEmpty: true as const };
  }

  if (parsePostDateToUtcMs(machineDatetime) === null) {
    return { renderEmpty: true as const };
  }

  const siteDateFormat =
    typeof data?.generalSettings?.dateFormat === 'string'
      ? data.generalSettings.dateFormat
      : null;

  const { isHumanDiff, phpDatePattern } = resolveDisplayFormat(
    formatAttr,
    siteDateFormat,
  );

  const permalink =
    typeof node?.uri === 'string' && node.uri.trim()
      ? node.uri.trim()
      : baseUri;

  return {
    renderEmpty: false as const,
    machineDatetime,
    permalink,
    showModifiedClass: field === 'modified',
    isHumanDiff,
    phpDatePattern,
  };
};
