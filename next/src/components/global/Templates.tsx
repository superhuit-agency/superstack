import Fallback from '../templates/Fallback';
import SinglePage from '../templates/SinglePage';

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
