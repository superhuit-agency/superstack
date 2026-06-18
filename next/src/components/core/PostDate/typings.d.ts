interface PostDateAttributes extends BlockAttributes {
	datetime?: string;
	displayType?: 'date' | 'modified';
	format?: string;
	isLink?: boolean;
	linkTarget?: string;
	textAlign?: 'left' | 'center' | 'right';
	style?: {
		elements?: {
			link?: {
				color?: {
					text?: string;
				};
			};
		};
	};
	metadata?: {
		bindings?: {
			datetime?: {
				source?: string;
				args?: {
					field?: 'date' | 'modified' | 'published';
				};
			};
		};
	};
}

interface PostDateProps extends PostDateAttributes {
	renderEmpty?: boolean;
	/** ISO / WP datetime for `<time datetime>` — instant is fixed; label is formatted on the client. */
	machineDatetime?: string;
	permalink?: string;
	showModifiedClass?: boolean;
	/** When true, visible label uses `formatHumanDiff` in the visitor’s local clock. */
	isHumanDiff?: boolean;
	/** PHP-style pattern from block `format` or WP `dateFormat` (used only when `isHumanDiff` is false). */
	phpDatePattern?: string;
}
