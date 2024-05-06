# WordPress Guides

## Database

### MySQL database access

Use your preferred tool to connect to MySQL — [Sequel Ace](https://github.com/Sequel-Ace/Sequel-Ace) for example.

-   Host: **127.0.0.1**
-   Port: **3306**
-   Database: **wordpress**
-   Username: **wordpress**
-   Password: **wordpress**

This stack does not start a phpmyadmin instance.

## Plugins

### Manage plugins

Plugins are handled with **composer**, in `./wordpress/composer.json` file. You don't need to have composer installed on your device as it's all handled on Docker directly. To add, update or remove a plugin:

-   Add plugins with `docker exec spck_wp composer require vendor/plugin-name`
-   Remove with `docker exec spck_wp composer remove vendore/plugin-name`
-   Install / Update plugins with `docker exec spck_wp composer install` or `docker exec spck_wp composer update`

Composer will automatically run while deploying to staging/production.

## WP CLI

You can use all the power of **wp-cli** in your terminal by running any wp-cli commands within the docker container.
For example: `docker exec spck_wp wp user list`

> [Read more](https://developer.wordpress.org/cli/commands/) about running commands inside WordPress containers.

## Email

### Debug emails

In `wordpress/theme/functions.php`, uncomment the code under `// Email debugging` and add your [Mailtrap.io](https://mailtrap.io/) username and password.
