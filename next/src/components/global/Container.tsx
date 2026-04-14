'use client';

import { FC, HTMLProps } from 'react';

import useHandleInternalLinks from '@/hooks/use-handle-internal-links';

interface ContainerProps extends HTMLProps<HTMLElement> {}

export const Container: FC<ContainerProps> = ({
	className,
	children,
	...props
}) => {
	const handleClick = useHandleInternalLinks();

	return (
		<main className={className} {...props} onClick={handleClick}>
			{children}
		</main>
	);
};
