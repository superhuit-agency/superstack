# Technical Choices

## Why not CSS modules or css-in-js?

**Short answer**

We want to make it easy to override styles from a parent, since we consider that spacing a `<ListItem>`s between them is the responsibility of their parent `<List>`.

**Detailed answer**

A bunch of us at superhuit love tailwind as well as css-in-js solutions (emotion, vanilla extract,…) for different projects. But when building a large/complex website with a flexible design, we need to prioritise **flexibility for overriding/layouting children**. A typical use case for that is innerBlocks: the parent React component does not have direct access to its children's props.

Css-in-js solutions, as well as css modules, are based on the principle that a `<Child>` must define which styles can be defined by its ancestors. Respecting this logic leads to aberrations like this https://github.com/styled-components/spec/issues/5#issuecomment-236413065
…whereas CSS is INTENDED to do this very easily.

The only solution we have with CSS Modules seems to be something like this, where we write classes twice all the time and use :global.

```js
// List.js
import { Item } from './Item.js';
import styles from './list.module.css';

export const List = () => (
    const items = ['A', 'B', 'C'];

    <ul className={`${styles.list} suptList`}>
        {items.map(item => <Item text={item} />)}
    </ul>
)
```

```js
// Item.js
import styles from './item.module.css';
export const Item = (text) => {
	return <li className={`${styles.item} suptItem`>{text}</li>;
};
```

```css
/* list.module.css */

.list {
	display: flex;

	.item {
		margin-bottom: 10px;
		color: green;
	}
}
```

```css
/* item.module.css */

.item {
	color: red;
}
```

Proposal: no css modules or css-in-js, back to good old CSS.

And so it just works®:

```js
// List.js
import { Item } from './Item.js';
import './list.css';

export const List = () => (
    const items = ['A', 'B', 'C'];

    <ul className="supt-list">
        {items.map(item => <Item text={item} />)}
    </ul>
)
```

```js
// Item.js
import './item.css';
export const Item = (text) => {
	return <li className="supt-item">{text}</li>;
};
```

```css
/* list.css */

.list {
	display: flex;

	.item {
		margin-bottom: 10px;
		color: green;
	}
}
```

```css
/* item.css */

.item {
	color: red;
}
```

Note: this example makes use of `postcss-nested` for nested selectors.

Caveat: we don't control the import order of css files, so we have to properly manage CSS specificity in our selectors. We can also use CSS layers.
