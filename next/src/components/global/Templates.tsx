import dynamic from 'next/dynamic';

const SinglePage = dynamic(() => import('../templates/SinglePage'));
const Fallback = dynamic(() => import('../templates/Fallback'));
interface TemplatesProps {
  node: any;
  contentType: string;
}

export const Templates = ({ node, contentType }: TemplatesProps) => {
  if (contentType === 'Page') {
    return <SinglePage node={node} />;
  }

  return <Fallback />;
};
