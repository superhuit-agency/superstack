import block from "./block.json";

export default function Spacer({ height }: SpacerProps) {
  return <div className="wp-block-spacer" aria-hidden="true" style={{ height }} />;
}

Spacer.slug = block.slug;
Spacer.title = block.title;
