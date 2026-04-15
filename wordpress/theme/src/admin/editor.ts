/* JavaScript for the block editor */
import { addFilter } from "@wordpress/hooks";
import * as filters from "@/components/filters";

import "./editor.css";

// Edit core blocks filters for WP editor
for (const key in filters) {
  if (Object.prototype.hasOwnProperty.call(filters, key)) {
    const filter: WpFilterType = filters[key as keyof typeof filters];
    addFilter(filter.hook, filter.namespace, filter.callback);
  }
}
