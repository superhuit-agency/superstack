# Deployement

## Automatic Github Actions

Automatic Github Actions are available but disabled by default.
To enable them, uncomment the relevant blocks in the `.github/workflows/deploy-preview.yml` and `.github/workflows/deploy-production.yml` files.

> _Example below of what you should uncomment to enable automatic deployment_

```
name: Deploy WP & Nextjs to Production - builds and deploys
on:
  # ######## Uncomment below block to enable automatic deployment <======= 🗑️ remove
  # push:                                                         <======= 📣 uncomment
  #   branches:                                                   <======= 📣 uncomment
  #     - 'production'                                            <======= 📣 uncomment
  #   # # Only run workflow if push a server tag                  <======= 📣 uncomment
  #   # tags:                                                     <======= 📣 uncomment
  #   #   - 'v*.*.*'                                              <======= 📣 uncomment
  # ########                                                      <======= 🗑️ remove
[...]
```

## 🔐 Github Actions variables and secrets

In order for the Github workflows to correctly execute, you need to configure [Actions variables](https://docs.github.com/en/rest/actions/variables) and [Actions secrets](https://docs.github.com/en/rest/actions/secrets).
You can for sure define them manually in the Github GUI, but the easiest way to do it is through the CLI. Here are the steps to achieve it:

1. Install [Github CLI](https://cli.github.com/) according to your system and preferences. (Homebrew is the easiest on Mac)
2. [Configure](https://cli.github.com/manual/#configuration) the CLI. -> `gh auth login` and follow the instructions
3. Push variables to Github. -> `gh variable set --env-file .env.github.variables.example`
4. Push secrets to Github. -> `gh secret set --env-file .env.github.secrets.example`

| Secret                    | Mandatory | Description                                               |
| ------------------------- | --------- | --------------------------------------------------------- |
| COMPOSER_GITHUB_TOKEN     | True      | Required by Github to access your repository              |
| NEXT_SSH_PRIVATE_KEY      | True      | Your private SSH key used to deploy the Next frontend app |
| RELEASE_BELT_PASSWORD     | False     | If you have a private source of plugins repository        |
| WORDPRESS_DB_PASSWORD     | True      | The Wordpress database password                           |
| WORDPRESS_SSH_PRIVATE_KEY | True      | Your private SSH key used to deploy the WP backend app    |

| Variable              | Mandatory | Default value             | Description                                                    |
| --------------------- | --------- | ------------------------- | -------------------------------------------------------------- |
| NEXT_SSH_HOST         | True      |                           | The Host name of your Next server, used to deploy via SSH      |
| NEXT_SSH_PATH         | True      |                           | The Path at which the SSH deployment will be done              |
| NEXT_SSH_PORT         | True      | 22                        | The SSH port used for deployment                               |
| NEXT_SSH_USER         | True      | superstack                | The SSH user used for deployment                               |
| NEXT_URL              | True      |                           | The URL of the Next Frontend website                           |
| RELEASE_BELT_USER     | False     |                           | If you have a private source of plugins repository             |
| WORDPRESS_ADMIN_EMAIL | True      |                           | Your default Wordpress admin email                             |
| WORDPRESS_ADMIN_USER  | True      | superstack                | Your default Wordpress admin user name                         |
| WORDPRESS_DB_HOST     | True      | localhost                 | The Wordpress database host                                    |
| WORDPRESS_DB_NAME     | True      | wordpress                 | The Wordpress database name                                    |
| WORDPRESS_DB_USER     | True      | wordpress                 | The Wordpress database user                                    |
| WORDPRESS_LOCALE      | True      | fr_FR                     | The Wordpress locale                                           |
| WORDPRESS_PATH        | True      |                           | The path on the server where the Wordpress website is located  |
| WORDPRESS_SSH_HOST    | True      |                           | The Host name of your Wordpress server, used to deploy via SSH |
| WORDPRESS_SSH_PORT    | True      | 22                        | The SSH port used for deployment                               |
| WORDPRESS_SSH_USER    | True      | superstack                | The SSH user used for deployment                               |
| WORDPRESS_THEME_NAME  | True      | superstack                | Name of the WordPress theme on remote server                   |
| WORDPRESS_THEME_TITLE | True      | "Superstack by Superhuit" | Title of the WordPress theme on remote server                  |
| WORDPRESS_URL         | True      |                           | The URL of your Wordpress backend website                      |
| WORDPRESS_VERSION     | True      | 6.5                       | Your Wordpres version                                          |

> ℹ️ Deployments are done automatically through Github workflows using SSH.
