# Superstack WordPress

Custom WordPress theme built on top of the bloc editor (aka. Gutenberg)

Made with ❤️ by [superhuit.ch](https://superhuit.ch)

## Prerequisites

- Docker
- Node.js / npm

## Getting Started

1. *(Optional)* Setup composer auth for privately hosted packages and repositories:
   - Run `npm run setup-composer-auth -- <domain> <username> <password>`
   - Example: `npm run setup-composer-auth -- release-belt.superhuit.ch USERNAME PASSWORD`

2. Start wordpress `npm start`
   > This will spin up the local WordPress development environment using Docker.

## Available npm Scripts

| Command       | Description                                                                      |
| ------------- | -------------------------------------------------------------------------------- |
| `start`       | Start the WordPress development environment (runs pre-start setup automatically) |
| `stop`        | Stop the WordPress development environment                                       |
| `setup-composer-auth` | Set one Composer auth entry (`domain user password`)                     |
| `dev`         | Start development theme assets build                                             |
| `build`       | Build theme assets                                                               |
| `clear-cache` | Clear patterns cache                                                             |
| `test`        | Placeholder test script                                                         |

## Database Migrations

When theme changes require updating existing content in the database (e.g. renaming CSS classes in block markup), migration scripts handle it.

Migrations run automatically during deployment via `provision.sh` (with a DB backup beforehand). They can also be run manually:

```sh
wp @local spck migrate            # run pending migrations
wp @local spck migrate --dry-run   # preview without executing
wp @local spck migrate --status    # show all migrations and their state
```

See [`wordpress/theme/migrations/README.md`](wordpress/theme/migrations/README.md) for details on creating and managing migrations.

## Theme CSS Generation

Theme CSS variables can be generated through a scripts in this repository.

- Script location: `wordpress/scripts/theme-css.sh`
- Command entrypoint (theme): `wp spck theme-css`

Use this when you need to refresh frontend-consumed theme CSS from WordPress internals.

## License

MIT

## DEPLOYMENT

In order for the github workflows to correctly execute, you need to configure [Actions secrets and variables](https://docs.github.com/en/actions/security-guides/encrypted-secrets) for each environment ("staging" and "production").

### Setting up environment variables and secrets

Secrets and variables are now managed per environment using GitHub Environments.

You can do this via the GitHub web UI:

1. Go to your repository on GitHub.
2. Navigate to **Settings > Environments**.
3. Select or create the `staging` and `production` environments.
4. Add the required **secrets** and **variables** for each environment as listed below.

Or, you can use the [GitHub CLI](https://cli.github.com/) to set secrets and variables for a specific environment:

```sh
gh secret set SECRET_NAME --env staging
gh secret set SECRET_NAME --env production
gh variable set VARIABLE_NAME --env staging
gh variable set VARIABLE_NAME --env production
```

or use the `.env.github.example` file and push the vars & secret with the Github CLI

1. `cp .env.github.example .env.github`
2. Edit the file with you secrets & vars. ℹ️ Comment / uncomment for each type & env you want to push
3. Push secrets/vars to Github. -> `gh [secret|vars] set --env-file .env.github --env [staging|production]`

> **Note:** Secrets are encrypted and hidden, while variables are plaintext but still environment-scoped.

| Name                 | Type     | Mandatory | Description                                   |
| -------------------- | -------- | --------- | --------------------------------------------- |
| SSH_PRIVATE_KEY      | Secret   | Yes       | Used to deploy to the remote server.          |
| COMPOSER_AUTHS       | Secret   | Yes       | Composer HTTP auths for premium plugins.      |
| WORDPRESS_THEME_NAME | Variable | Yes       | Name of the WordPress theme on remote server. |
| WORDPRESS_PATH       | Variable | Yes       | Absolute path to WP root directory.           |

> ℹ️ Deployments are done automatically through GitHub workflows.
> See `.github/workflows/deploy-production.yml`, `.github/workflows/deploy-preview.yml` and `.github/workflows/deploy-future.yml` for workflow definitions.
> Full deployment setup details are documented in `docs/setup/deployment.md`.
