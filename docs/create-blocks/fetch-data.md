# 🛠 How to Fetch Data

If your block needs data from WP you'll need to fetch them with GraphQL and format them to fit your block's props.<br />
This is where the `data.ts` file is needed within your block's folder.

> **Create a Custom Post Type**<br />
> You may need to create a CPT to fetch some datas from within a block. [Follow this guide to do so](../setup/create-custom-post-types.md).

## Data Fetching

The `getData` function is responsible for fetching data from WP using GraphQL. It is called in 2 places :

-   if you need to fetch datas on WP side, it can be called within your block's Edit function (in `edit.tsx`)
-   if you need to fetch datas on the frontend, there's nothing to do as all `getData` functions are called on Server side when parsing each blocks of a page (see [`getBlockFinalComponentProps`](../../src/lib/get-block-final-component-props.ts))

### Parameters

-   `fetcher`: The context-based function to request the GraphQL endpoint.
-   `attributes`: Optional block attributes that might influence the query.
-   `isEditor`: Indicates whether the fetching is done within the WordPress block editor.

### Definition

```ts
export const getData = async (
  fetcher: FetchApiFuncType,
  attributes: Record<string, object> | null = null,
  isEditor: boolean = false
): Promise<any> => {
  // GraphQL query and fetching logic goes here
  const query = gql`
    query MyQuery {
      title
      description
      ...
    }
  `;

  const data = await fetcher(query, { variables: {...} });

  return formatter(data);
};
```

### Usage

You only need to call `getData` manually inside the `edit.tsx` files for WP side. On Next.js it's handled automatically on Server Side when fetching the blocks.

#### Fetching data without parameters in `edit.tsx` file :

```ts
const {
	isLoading,
	data: { items },
} = useGraphQlApi(getData);

return isLoading ? (
  <Spinner />
) : (
  items.map(item => (
    <Item key={item.id} {...item} />
  ))
);
```

#### Fetching data with parameters in `edit.tsx` file :

You can use some Helpers (`PostsSelectControl`, `TermsSelectControl`) to filter the datas according to Taxonomies and/or Posts.<br />
[Read more about these helpers](./make-block-editable.md#custom-components)

```ts
const { queryVars } = props.attributes;

const variables = useMemo(() => ({ queryVars }), [queryVars]); // We need a useMemo to only fetch datas when queryVars has changed

const {
	isLoading,
	data: { items },
} = useGraphQlApi(getData, variables);

return (
  <>
    <InspectorControls>
      <PanelBody title={_x('Settings', 'Section', 'supt')}>
        <PanelRow>
          <TermsSelectControl
            taxonomy={'item_category'}
            values={queryVars?.categoryIn}
            label={_x('Categories', 'Section', 'supt')}
            onChange={(categoryIn) =>
              props.setAttributes({
                queryVars: { ...queryVars, categoryIn },
              })
            }
          />
        </PanelRow>
      </PanelBody>
    </InspectorControls>

    {isLoading ? (
      <Spinner />
    ) : (
      items.map(item => (
        <Item key={item.id} {...item} />
      ))
    )}
  <>
)
```

## Data Formatter

The `formatter` function is used to parse or format the raw data fetched from the GraphQL query. It is called directly from the `getData` function.

### Parameters

-   `data`: The raw data from the GraphQL query response.
-   `isEditor`: A boolean flag indicating if the function is executed within the WordPress block editor environment.

### Definition

```ts
export const formatter = (data: unknown) => {
  // Custom formatting logic goes here
  return {
    name: data.title,
    descr: data.description,
    ...
  };
};
```

You can also call a `formatter` function from a child block directly inside the parent block. It's the case for the `CardNews`' formatter for example, which is called inside the `SectionNews`'s formatter -- to avoid duplicated formatting code.

## GraphQL Fragment (Optional)

A GraphQL fragment template can be exported and used in another block's query for fetching related data. It's the case for the `CardNews` fragment for example which is used in the `SectionNews`'s `getData` function.

### Definition

(in `CardNews/data.ts`)

```ts
export const fragment = gql`
  fragment myBlockFragment on Post {
    title
    description
    ...
  }
`;
```

### Usage

(in `SectionNews/data.ts`)

```ts
export const getData = async (...) {
  const query = gql`
    query sectionNewsQuery {
      posts {
        nodes {
         ...cardNewsFragment
        }
      }
    }
    ${cardNewsData.fragment}
  `;
};

```
