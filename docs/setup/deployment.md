# Deployment

## Automatic GitHub Actions

Automatic GitHub Actions are available but disabled by default.
To enable them, uncomment the relevant trigger blocks in the workflow files:

- `.github/workflows/deploy-preview.yml`
- `.github/workflows/deploy-production.yml`

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

## 🎨 Automatic Theme CSS Generation

The Next.js app requires `next/public/css/theme-generated.css` before its build runs. See [`./theme-css.md`](./theme-css.md) for the full how-to (what the file is, local-dev usage, troubleshooting). This section covers the CI integration only.

During each deployment workflow:

1. The **"Generate Theme CSS from Remote"** step (in the deployment workflow) SSH-es to your remote WordPress server
2. Executes the `wp spck theme-css` WP-CLI command on the remote server
3. Downloads the generated CSS file back to the CI runner
4. Places it at `next/public/css/theme-generated.css` (the location where Next.js expects it)
5. The subsequent "Build Theme" step uses this CSS file during the build

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

| Variable               | Mandatory                      | Description                                                                                                                                                                                                      |
| ---------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SSH_HOST`             | Yes                            | Remote server SSH host (IP address or domain name).                                                                                                                                                              |
| `SSH_PORT`             | Yes                            | Remote server SSH port number. Default `22`.                                                                                                                                                                     |
| `SSH_USER`             | Yes                            | Remote server SSH user.                                                                                                                                                                                          |
| `WORDPRESS_PATH`       | Yes                            | Absolute path to the WP root directory on the remote server.                                                                                                                                                     |
| `WORDPRESS_URL`        | Yes                            | WordPress admin URL (e.g. `https://admin.yourdomain.com`).                                                                                                                                                       |
| `WORDPRESS_THEME_NAME` | Yes                            | Name of the WordPress theme folder on the remote server.                                                                                                                                                         |
| `NEXT_URL`             | Yes                            | Public URL of the Next.js frontend (e.g. `https://yourdomain.com`).                                                                                                                                              |
| `NEXT_PATH`            | SSH deployment only            | Absolute path to the **live Next.js path** on the remote server (example: `/var/www/next/current`). This path becomes a [symlink to the current](#ssh-release-strategy-when-vercel_project_id-is-empty) release. |
| `PM2_APP_NAME`         | SSH deployment only            | PM2 application name used by `.github/actions/next-pm2` to run `pm2 describe`, then either `pm2 restart <app>` or `pm2 start ecosystem.config.js --only <app>`.                                                  |
| `KEEP_RELEASES`        | SSH deployment only (optional) | Number of most recent releases to keep on server. Default: `5`.                                                                                                                                                  |
| `VERCEL_ORG_ID`        | Vercel deployment only         | Your Vercel org/user ID. Found at vercel.com → Account settings → General (bottom of page).                                                                                                                      |
| `VERCEL_PROJECT_ID`    | Vercel deployment only         | Your Vercel project ID. Found at vercel.com → Project → Settings → General (bottom of page). **If set, Vercel deployment is used; if empty, SSH deployment is used.**                                            |

### Environment secrets (`secrets.*`)

These are sensitive values that GitHub will mask in logs. Set them with `gh secret set`.

| Secret            | Mandatory              | Description                                                                                   |
| ----------------- | ---------------------- | --------------------------------------------------------------------------------------------- |
| `SSH_PRIVATE_KEY` | Yes                    | Private SSH key used to connect to the remote server.                                         |
| `VERCEL_TOKEN`    | Vercel deployment only | Vercel API access token. See https://vercel.com/guides/how-do-i-use-a-vercel-api-access-token |

> ℹ️ Deployments are done automatically through Github workflows. By default Next.js is deployed to Vercel when `VERCEL_PROJECT_ID` is set in the environment, otherwise it falls back to SSH deployment via `.github/actions/next-deploy`.

### SSH release strategy (when `VERCEL_PROJECT_ID` is empty)

Next.js deployments via SSH use a release-based strategy to reduce downtime and allow rollbacks:

1. A new release folder is created under `releases/<release-id>`.
2. Build artifacts are uploaded to this new release folder.
3. Production dependencies are installed in that release (`npm ci --omit=dev`).
4. The live path (`NEXT_PATH`) is atomically switched to the new release (symlink swap).
5. `.github/actions/next-pm2` ensures `ecosystem.config.js` is symlinked from `shared/` and then checks `PM2_APP_NAME`: restart if it exists, start if it does not.
6. Old releases are cleaned up, keeping the newest `KEEP_RELEASES` releases.

Example folder structure (if `NEXT_PATH=/var/www/next/current`)

After first deploy:

      /var/www/next/
         current -> /var/www/next/releases/20260419153000-123456789-1
         releases/
            20260419153000-123456789-1/
               .next/
               public/
               package.json
               package-lock.json
               next.config.ts
               node_modules/
               .env -> /var/www/next/shared/.env
         shared/
            .env

After subsequent deploys:

      /var/www/next/
         current -> /var/www/next/releases/20260420104510-123456999-1
         releases/
            20260419153000-123456789-1/
            20260420093044-123456900-1/
            20260420104510-123456999-1/
         shared/
            .env

Notes:

1. `NEXT_PATH` (for example `current`) is the live symlink used by PM2/Next start commands.
2. Rollback is done by repointing `next` to an older release still present in `releases/`.
3. Cleanup keeps the latest `KEEP_RELEASES` folders (default: 5).

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
