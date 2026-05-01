# Ubiquitous Language

## Gutenberg layout blocks

| Term | Definition | Aliases to avoid |
| --- | --- | --- |
| **Columns block** | The `core/columns` container that arranges `Column` children in a flex layout. | Colonnes wrapper, columns container block |
| **Column block** | One `core/column` item inside a `Columns block` whose width is controlled by `flex-basis`. | Child column div, inner column wrapper |
| **Group block** | The `core/group` layout container that can run in constrained, row, stack, or grid mode. | Generic wrapper, section wrapper |
| **Row mode** | Group flex mode with horizontal flow and optional wrapping. | Horizontal group, line mode |
| **Stack mode** | Group flex mode with vertical flow and content justification by `align-items`. | Vertical group, column mode |
| **Grid mode (auto)** | Group grid mode driven by `minimumColumnWidth` and auto-fill template columns. | Responsive grid mode |
| **Grid mode (manual)** | Group grid mode driven by a fixed `columnCount`. | Fixed-column grid |
| **Layout class parity** | Reusing WordPress class naming (`is-layout-*`, `wp-block-*-is-layout-*`, `is-content-justification-*`) in Next rendering. | Approximate class naming |

## Frontend data and rendering

| Term | Definition | Aliases to avoid |
| --- | --- | --- |
| **Block attributes** | WordPress-provided attributes passed to React block components. | Raw props blob |
| **DOM-safe props** | Props allowed to reach HTML elements after stripping editor-only or unknown attributes. | All-props passthrough |
| **FSE templates snapshot** | The generated `next/src/lib/fse/fse-templates-and-parts.json` file used by Next template rendering. | Random JSON cache, temporary dump |

## Relationships

- A **Columns block** contains one or more **Column blocks**.
- A **Column block** may define width through block attributes that map to `flex-basis`.
- A **Group block** runs in one of four layout families: constrained, **Row mode**, **Stack mode**, or **Grid mode (auto/manual)**.
- **Layout class parity** is implemented by converting **Block attributes** into WordPress-compatible class names.
- **DOM-safe props** protect rendering by preventing editor-only attributes from leaking to HTML.

## Example dialogue

> **Dev:** "In this page section, should I use a **Group block** in **Row mode** or a **Columns block**?"
> **Domain expert:** "Use **Columns block** if each child is a true **Column block** with optional width control."
> **Dev:** "And for a simple horizontal button list with wrap?"
> **Domain expert:** "That is a **Group block** in **Row mode** with layout classes kept in **Layout class parity**."
> **Dev:** "If grid needs responsive cards, we use **Grid mode (auto)** with `minimumColumnWidth`?"
> **Domain expert:** "Exactly, and Next picks it from **Block attributes** while keeping **DOM-safe props**."

## Flagged ambiguities

- "group" is used both for the `core/group` block and generic wrappers; use **Group block** only for `core/group`.
- "column width" can mean CSS `width` or flex sizing; in this stack it means **`flex-basis` derived from block attributes**.

