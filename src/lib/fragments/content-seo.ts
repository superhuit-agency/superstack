import { gql } from '@/utils';

export const seoTaxFragment = gql`
	fragment seoTaxFragment on TaxonomySEO {
		title
		metaDesc
		metaKeywords
		metaRobotsNoindex
		metaRobotsNofollow
		canonical
		# schema {
		# 	raw
		# }
		opengraphTitle
		opengraphDescription
		opengraphUrl
		opengraphImage {
			src: sourceUrl
		}
		twitterTitle
		twitterDescription
		twitterImage {
			src: sourceUrl
		}
		breadcrumbs {
			text
			url
		}
	}
`;

export const seoPostTypeFragment = gql`
	fragment seoPostTypeFragment on PostTypeSEO {
		title
		metaDesc
		metaKeywords
		metaRobotsNoindex
		metaRobotsNofollow
		canonical
		# schema {
		# 	raw
		# }
		opengraphTitle
		opengraphDescription
		opengraphUrl
		opengraphImage {
			src: sourceUrl
		}
		twitterTitle
		twitterDescription
		twitterImage {
			src: sourceUrl
		}
		breadcrumbs {
			text
			url
		}
	}
`;
