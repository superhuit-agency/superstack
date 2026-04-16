import { gql } from '@/utils';

export const getData = async (
  fetcher: FetchApiFuncType,
  attrs: SiteLogoAttributes | null = null,
) => {
  const query = gql`
    query SiteLogoData {
      siteLogo {
        sourceUrl
        altText
        mediaDetails {
          width
          height
        }
      }
    }
  `;

  const data = await fetcher(query);
  const siteLogo = data?.siteLogo;

  if (!siteLogo?.sourceUrl) {
    return {};
  }

  const computedWidth =
    typeof attrs?.width === 'number' && attrs.width > 0
      ? attrs.width
      : siteLogo?.mediaDetails?.width;

  let computedHeight = siteLogo?.mediaDetails?.height;
  if (
    typeof attrs?.width === 'number' &&
    attrs.width > 0 &&
    typeof siteLogo?.mediaDetails?.width === 'number' &&
    siteLogo.mediaDetails.width > 0 &&
    typeof siteLogo?.mediaDetails?.height === 'number'
  ) {
    computedHeight = Math.round(
      attrs.width / (siteLogo.mediaDetails.width / siteLogo.mediaDetails.height),
    );
  }

  return {
    url: siteLogo.sourceUrl,
    alt: siteLogo.altText ?? '',
    width: computedWidth,
    height: computedHeight,
  };
};
