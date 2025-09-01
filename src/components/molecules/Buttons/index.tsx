import { FC } from 'react';

import block from './block.json';

// styles
import './styles.css';

export const Buttons: FC<ButtonsProps> & BlockConfigs = ({ children }) => {
	return <div className="supt-buttons">{children}</div>;
};

Buttons.slug = block.slug;
Buttons.title = block.title;
