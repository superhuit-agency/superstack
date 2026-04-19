import cx from 'classnames';

import block from "./block.json";

import "./styles.css";

export default function TemplatePart({
  area,
  slug,
  tagName,
  children
}: TemplatePartProps) {
  const Tag = tagName || area === 'header' ? 'header' : area === 'footer' ? 'footer' : 'div';
  return (
    <Tag className={cx("wp-block-template-part", `supt-template-part-${slug}`)}>
      {children}
    </Tag>
  );
}

TemplatePart.slug = block.slug;
TemplatePart.title = block.title;
