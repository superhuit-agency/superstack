interface SocialLinksAttributes extends BlockAttributes {
	children: React.ReactNode;
	align: 'left' | 'center' | 'right';
	layout?: {
		justifyContent?: 'left' | 'center' | 'right' | 'space-between';
	};
}

interface SocialLinksProps extends SocialLinksAttributes {}
