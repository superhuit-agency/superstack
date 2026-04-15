import cx from "classnames";
import block from "./block.json";

import "./styles.css";

export default function Separator({ className }: React.HTMLProps<HTMLDivElement>) {
  return <hr className={cx("wp-block-separator", className)} />;
}

Separator.slug = block.slug;
Separator.title = block.title;
