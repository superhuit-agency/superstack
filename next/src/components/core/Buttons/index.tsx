import cx from "classnames";
import { FC } from "react";

import block from "./block.json";

// styles
import "./styles.css";

const Buttons: FC<ButtonsProps> & BlockConfigs = ({
  children,
  layout,
}) => {
  return (
    <div
      className={cx("wp-block-buttons", {
        'is-vertical': layout?.orientation === 'vertical',
        [`is-content-justification-${layout?.justifyContent}`]:
          layout?.justifyContent,
      })}
    >
      {children}
    </div>
  );
};

Buttons.slug = block.slug;
Buttons.title = block.title;

export default Buttons;
