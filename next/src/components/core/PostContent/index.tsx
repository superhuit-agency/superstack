import block from "./block.json";

import "./styles.css";

export default function PostContent({
  tagName,
  children
}: PostContentProps) {
  const Tag = tagName || 'div';
  return (
    <Tag className="wp-block-post-content">
      {children}
    </Tag>
  );
}

PostContent.slug = block.slug;
PostContent.title = block.title;
