import { Container, Blocks } from '@/components/global';
import { rootBlocksList } from '@/components/root-block-lists';

import './styles.css';

export default function Page({ node }: SinglePageProps) {
	return (
		<>
			<Blocks
				blocksList={rootBlocksList}
				blocks={node?.blocksJSON}
				includes={/^supt\/page-header/g}
			/>
			<Container className="supt-single-page">
				<Blocks
					blocksList={rootBlocksList}
					blocks={node?.blocksJSON}
					excludes={/^supt\/page-header/g}
				/>
			</Container>
		</>
	);
}
