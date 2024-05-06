import { FC, HTMLProps } from 'react';

import { BlockConfigs } from '@/typings';

import block from './block.json';

// styles
import './styles.css';

/**
 * TYPINGS
 */
export interface ListProps extends HTMLProps<HTMLUListElement> {
	ordered: boolean;
	reversed?: boolean;
	start?: number;
}

/**
 * COMPONENT
 */
export const List: FC<ListProps> & BlockConfigs = ({
	ordered,
	reversed,
	start,
	children,
}) => {
	return (
		<>
			{ordered ? (
				<ol
					className="supt-list"
					style={{
						counterSet: start ? `li ${start + 1}` : undefined,
					}}
					reversed={reversed}
				>
					{children}
				</ol>
			) : (
				<ul className="supt-list">{children}</ul>
			)}
		</>
	);
};

List.slug = block.slug;
List.title = block.title;
