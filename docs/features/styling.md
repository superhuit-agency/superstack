# Styling

This stack uses PostCSS for the styling ([why?](../technical-choices.md))

## PostCSS Mixins

The stack comes with a bunch of mixins and placeholders. You can see them in the `src/css/resources/helpers/_mixins.css` and `src/css/resources/helpers/_placeholders.css` files.

For more complex mixins that need calculation you can set them in the [`src/css/mixins`](../../src/css/mixins) folder. Like it's the case for the `clamp` mixin.

### `Clamp` mixin

The `clamp` mixin returns a fluid sizing for any property. This is useful to handle fluid responsive values.

#### Parameters :

| Name                       | Type   | Description                  |
| -------------------------- | ------ | ---------------------------- |
| property                   | string | The property to act on       |
| min size (px but unitless) | number | The minimum size             |
| max size (px but unitless) | number | The maximum size             |
| min breakpoint (px)        | string | The minimum breakpoint in px |
| max breakpoint (px)        | string | The maximum breakpoint in px |

#### Example :

```css
 // postcss
 @mixin clamp width, 24, 32, 600px, 900px;

 // css (what's returned)
 width: clamp(1.5rem, 2.5vw + 0.5rem, 2rem);
```
