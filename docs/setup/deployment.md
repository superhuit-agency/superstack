# Deployment

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

## 🔐 Github Actions variables & secrets

The workflows use GitHub [Environments](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment) (`staging` and `production`) to scope their configuration. Each environment holds its own set of **variables** (non-sensitive, `vars.*`) and **secrets** (sensitive, `secrets.*`).

You can configure them manually in the GitHub GUI under **Settings > Environments**, or via the CLI:

1. Install [Github CLI](https://cli.github.com/) according to your system and preferences. (Homebrew is the easiest on Mac)
2. [Configure](https://cli.github.com/manual/#configuration) the CLI. → `gh auth login` and follow the instructions
3. Copy the example env files and fill in the values:
   - `cp .env.github.example .env.github.vars` then edit it
   - `cp .env.github.example .env.github.secrets` then edit it
   - ⚠️ Do not track these files in the repo as they contain sensitive values
4. Push variables and secrets to GitHub for each environment:
   - `gh variable set -f .env.github.vars --env staging`
   - `gh secret set -f .env.github.secrets --env staging`
   - Repeat with `--env production` for the production environment

> ℹ️ Variables and secrets are set **per environment**. You must repeat the process for both `staging` and `production` environments with their respective values.

### Environment variables (`vars.*`)

These are non-sensitive configuration values. Set them with `gh variable set`.

| Variable                  | Mandatory                      | Description                                                                                                                                                                                                              |
| ------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `SSH_HOST`                | Yes                            | Remote server SSH host (IP address or domain name).                                                                                                                                                                      |
| `SSH_PORT`                | Yes                            | Remote server SSH port number. Default `22`.                                                                                                                                                                             |
| `SSH_USER`                | Yes                            | Remote server SSH user.                                                                                                                                                                                                  |
| `WORDPRESS_PATH`          | Yes                            | Absolute path to the WP root directory on the remote server.                                                                                                                                                             |
| `WORDPRESS_URL`           | Yes                            | WordPress admin URL (e.g. `https://admin.yourdomain.com`).                                                                                                                                                               |
| `WORDPRESS_THEME_NAME`    | Yes                            | Name of the WordPress theme folder on the remote server.                                                                                                                                                                 |
| `NEXT_URL`                | Yes                            | Public URL of the Next.js frontend (e.g. `https://yourdomain.com`).                                                                                                                                                     |
| `NEXT_PATH`               | SSH deployment only            | Absolute path to the **parent** folder of the Next.js app on the remote server. ⚠️ Parent folder is required because deployments go to a `_new` subfolder first, then swap with the live folder to minimize downtime.   |
| `VERCEL_ORG_ID`           | Vercel deployment only         | Your Vercel org/user ID. Found at vercel.com → Account settings → General (bottom of page).                                                                                                                             |
| `VERCEL_PROJECT_ID`       | Vercel deployment only         | Your Vercel project ID. Found at vercel.com → Project → Settings → General (bottom of page). **If set, Vercel deployment is used; if empty, SSH deployment is used.**                                                   |

### Environment secrets (`secrets.*`)

These are sensitive values that GitHub will mask in logs. Set them with `gh secret set`.

| Secret            | Mandatory              | Description                                                                                                                    |
| ----------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `SSH_PRIVATE_KEY` | Yes                    | Private SSH key used to connect to the remote server.                                                                          |
| `VERCEL_TOKEN`    | Vercel deployment only | Vercel API access token. See https://vercel.com/guides/how-do-i-use-a-vercel-api-access-token                                  |

> ℹ️ Deployments are done automatically through Github workflows. By default Next.js is deployed to Vercel when `VERCEL_PROJECT_ID` is set in the environment, otherwise it falls back to SSH deployment via `.github/actions/next-build`.

## 🚀 Production deployments

When we push to the `production` git branch, Next.js and WordPress are automatically deployed to production.

```
Next.js   -> https://yourdomain.com
WordPress -> https://admin.yourdomain.com
```

See [.github/workflows/deploy-production.yml](../../.github/workflows/deploy-production.yml) for more details.

## 👁 Preview deployments

> Same behavior as production but for by default for staging environment

## 🔨 Custom deployments

Duplicate `.github/workflows/deploy-production.yml` file and edit the secrets to deploy WordPress and/or Next to a specific instance.

Be sure to not forget to add the custom action secrets to Github.