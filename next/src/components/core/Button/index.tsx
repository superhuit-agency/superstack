import { FC } from "react";
import cx from "classnames";

import { Link } from "@/components/custom/atoms/Link";

import block from "./block.json";

// styles
import "./styles.css";

const Button: FC<ButtonProps> & BlockConfigs = ({
  text = "",
  url,
  className,
  variant = "fill",
  linkTarget,
  rel,
  onClick,
  width,
}) => {
  return text ? (
    <div
      className={cx(
        "wp-block-button",
        `is-style-${variant}`,
        className,
      )}
      style={{
        width: width ? `${width}%` : undefined,
      }}
    >
      <Link
        className="wp-block-button__link"
        href={url}
        target={linkTarget || undefined}
        rel={rel || undefined}
        onClick={onClick}
      >
        <span
          className="wp-block-button__text"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      </Link>
    </div>
  ) : null;
};

Button.slug = block.slug;
Button.title = block.title;

export default Button;
