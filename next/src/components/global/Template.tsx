import { Blocks } from '@/components/global';

// TODO: Add typings
export default function Template({ node }: any) {
  return (
    <Blocks blocks={node?.blocks} />
  );
}
