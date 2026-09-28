type GroupTagName =
	| 'div'
	| 'section'
	| 'header'
	| 'main'
	| 'footer'
	| 'article'
	| 'aside';

type GroupLayoutType = 'constrained' | 'flow' | 'flex' | 'grid';

interface BoxSpacing {
	top?: string;
	right?: string;
	bottom?: string;
	left?: string;
}
interface GroupAttributes {
	tagName?: GroupTagName;
	anchor?: string;
	layout?: {
		type?: GroupLayoutType;
		orientation?: 'horizontal' | 'vertical';
		flexWrap?: 'nowrap' | 'wrap';
		justifyContent?:
			| 'left'
			| 'center'
			| 'right'
			| 'space-between'
			| 'stretch';
		verticalAlignment?: 'top' | 'center' | 'bottom';
		columnCount?: number;
		minimumColumnWidth?: string;
	};
	style?: {
		layout?: {
			columnStart?: number;
			columnSpan?: number;
		}
		spacing?: {
			padding?: BoxSpacing;
			margin?: BoxSpacing;
		};
	}
}

interface GroupProps extends Omit<React.HTMLProps<HTMLDivElement>, 'style'>, GroupAttributes {}
