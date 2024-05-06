import { Container, Blocks } from '@/components/global';

import './styles.css';

export default function Page({ node }: any) {
	return (
		<>
			<Blocks
				blocks={node?.blocksJSON}
				includes={/^supt\/page-header/g}
			/>
			<Container className="supt-single-page">
				<Blocks
					blocks={node?.blocksJSON}
					excludes={/^supt\/page-header/g}
				/>
			</Container>
		</>
	);
}
