import { HTMLAttributes } from 'react';

export const CloseIcon = (props: HTMLAttributes<SVGElement>) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="22"
			height="22"
			viewBox="0 0 22 22"
			fill="currentColor"
			aria-hidden="true"
			{...props}
		>
			<path d="M5.86665 17.592L4.40796 16.1333L9.54129 11L4.40796 5.86665L5.86665 4.40796L11 9.54129L16.1333 4.40796L17.592 5.86665L12.4587 11L17.592 16.1333L16.1333 17.592L11 12.4587L5.86665 17.592Z" />
		</svg>
	);
};
