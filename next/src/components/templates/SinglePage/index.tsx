import { Blocks, Container } from '@/components/global';
import './styles.css';

// TODO: Add typings
export default function Page({ node }: any) {
  return (
    <>
      <Blocks blocks={node?.blocksJSON} includes={/^supt\/page-header/g} />
      <Container className="supt-single-page">
        <Blocks blocks={node?.blocksJSON} excludes={/^supt\/page-header/g} />
      </Container>
    </>
  );
}
