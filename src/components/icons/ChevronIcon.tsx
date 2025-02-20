import { HTMLAttributes } from 'react';

export const ChevronIcon = (props: HTMLAttributes<SVGElement>) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 20 20"
			fill="none"
			stroke="currentcolor"
			aria-hidden="true"
			{...props}
		>
			<path
				d="M8.33398 5.83317L12.5007 9.99984L8.33398 14.1665"
				strokeWidth="1.5"
			/>
		</svg>
	);
};
