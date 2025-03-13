interface LinkAttributes extends BlockAttributes {}

interface LinkProps
	extends LinkAttributes,
		BlockProps,
		React.HTMLProps<HTMLAnchorElement> {
	prefetch?: boolean;
	ref?: Ref<HTMLAnchorElement>;
	scroll?: boolean;
}
