# Create Custom Post Types

> NOTE : This documentation is in WIP

## Custom Post Type

1. Create a new file in `wordpress/theme/lib/post-types` called `YourType.php`

2. Extend `Type` or `TypeWithArchive` from `wordpress/theme/lib/post-types` depending on your needs.<br />`TypeWithArchive` will expose more GraphQL and global settings that you may need for your CPT pages.

3. Edit the labels and names used by WP and GraphQL

4. Export your CPT file in `wordpress/theme/lib/post-types/_loader.php`.

5. Init your CPT inside the `$post_types` array of `wordpress/theme/lib/post-types/_loader.php` file.

### Example:

```php
class MyCpt extends Type {
  /**
   * Constants
   */
  const NAME = 'my_cpt';
  const GRAPHQL_TYPE_NAME = 'MyCpt';

  /**
   * Bind all you action & filter hooks in here.
   */
  function __construct() {
    parent::__construct();
  }

  function register() {
    register_post_type(self::NAME, [
        // ...
        'rewrite'               => true, // If your type has an archive
        'show_in_graphql'       => true,
        'graphql_single_name'   => 'my_cpt',
        'graphql_plural_name'   => 'my_cpts',
        'graphql_singular_type' => 'MyCpt',
        'graphql_plural_type'   => 'MyCpts',
      ]
    );
  }

  function getName() { return self::NAME; }
  function getGraphQLTypeName() { return self::GRAPHQL_TYPE_NAME; }
}
```

## Custom Taxonomy

1. Create a new file in `wordpress/theme/lib/taxonomies` called `YourTypeTaxonomy.php`

2. Extend `Taxonomy` or `TaxonomyWithArchive` from `wordpress/theme/lib/taxonomies` depending on your needs.<br />`TaxonomyWithArchive` will expose more GraphQL and global settings that you may need for your CPT pages.

3. Edit the labels and names used by WP and GraphQL

4. Init your Taxonomy with `new MyCptCategory()`.

5. Export your Taxonomy file in `wordpress/theme/lib/taxonomies/_loader.php`.

### Example:

```php
class MyCptCategory extends Taxonomy {

  const NAME = 'my_cpt_category';
  const PLURAL_NAME = 'my_cpt_categories';
  const WHERE_ARG = 'myCptCategoryIn';

  /**
   * Hook into WP actions & filter
   */
  function __construct() {
    parent::__construct();

    add_action( 'init', [ $this, 'register' ] );
  }

  function getName() { return self::NAME; }
  function getPluralName() { return self::PLURAL_NAME; }
  function getWhereArg() { return self::WHERE_ARG; }
  function getConnectedGraphQLTypeName() { return MyCpt::GRAPHQL_TYPE_NAME; }

  /**
   * Register the Taxonomy
   */
  function register() {
    $args = [
      // ...
      'show_in_graphql'     => true,
      'graphql_single_name' => 'MyCptCategory',
      'graphql_plural_name' => 'MyCptCategories'
    ];

    register_taxonomy( self::NAME, MyCpt::NAME, $args );
  }
}

new MyCptCategory();


```
