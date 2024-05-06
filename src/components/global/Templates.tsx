import ArchivePost from '../templates/ArchivePost';
import Fallback from '../templates/Fallback';
import SinglePage from '../templates/SinglePage';
import SinglePost from '../templates/SinglePost';

interface TemplatesProps {
	node: any;
	contentType: string;
}

export const Templates = ({ node, contentType }: TemplatesProps) => {
	if (node?.archivePage) {
		return <ArchivePost node={node} />;
	} else if (contentType === 'Page') {
		return <SinglePage node={node} />;
	} else if (contentType === 'Post') {
		return <SinglePost node={node} />;
	}

	return <Fallback />;
};
