# Deployement

In order for the Github workflows to correctly execute, you need to configure [Actions secrets](https://docs.github.com/en/rest/actions/secrets).
You can for sure define them manually in the Github GUI, but the easiest way to do it is through the CLI. Here are the steps to achieve it:

1. Install [Github CLI](https://cli.github.com/) according to your system and preferences. (Homebrew is the easiest on Mac)
2. [Configure](https://cli.github.com/manual/#configuration) the CLI. -> `gh auth login` and follow the instructions
3. Copy `.env.github.example` file and edit the secrets. -> `cp .env.github.example .env.github`. ⚠️ Do not track this file in the repo as it is secrets
4. Push secrets to Github. -> `gh secret set --env-file .env.github`

| Secret                    | Mandatory | Description                                                                                                                                                                                                             |
| ------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REVALIDATE_SECRET         | True      | Secret token only known by your Next.js & WP backend app. This secret will be used to prevent unauthorized access to the revalidation API Route.                                                                        |
| WORDPRESS_THEME_NAME      | True      | Name of the WordPress theme on remote server                                                                                                                                                                            |
| SSH_PRIVATE_KEY           | True      | Will be used to deploy to the remote server. We consider that for both Staging/preview & production servers the same key will be used.                                                                                  |
| VERCEL_TOKEN              | False     | Mandatory if deploying to Vercel. https://vercel.com/guides/how-do-i-use-a-vercel-api-access-token                                                                                                                      |
| VERCEL_ORG_ID             | False     | Mandatory if deploying to Vercel. Your "Org ID" is also called your user ID or team ID, and it's found at vercel.com/account > settings > general -- at the bottom                                                      |
| VERCEL_PROJECT_ID         | False     | Mandatory if deploying to Vercel. Your "Project ID" is found at vercel.com/dashboard > your project name > settings > general -- at the bottom                                                                          |
| PM2_APP_NAME              | False     | Mandatory if deploying Next.js to your own server.                                                                                                                                                                      |
| STAGING_BE_SSH_USER       | True      | Remote server SSH user.                                                                                                                                                                                                 |
| STAGING_BE_SSH_HOST       | True      | Remote server SSH host IP address or domain name                                                                                                                                                                        |
| STAGING_BE_SSH_PORT       | True      | Remote server SSH port number. Default 22.                                                                                                                                                                              |
| STAGING_WORDPRESS_PATH    | True      | Absolute path to WP root directory.                                                                                                                                                                                     |
| STAGING_WORDPRESS_URL     | True      | Admin URL.                                                                                                                                                                                                              |
| STAGING_NEXT_PATH         | False     | Mandatory if deploying Next.js to your own server. Absolute path to the parent folder of Next.js app. ⚠️ Parent folder because to reduce the downtime we deploy to `_new` folder, then switch with the `public` folder. |
| STAGING_NEXT_URL          | False     | Mandatory if deploying Next.js to your own server.                                                                                                                                                                      |
| PRODUCTION_BE_SSH_USER    | True      | Remote server SSH user.                                                                                                                                                                                                 |
| PRODUCTION_BE_SSH_HOST    | True      | Remote server SSH host IP address or domain name                                                                                                                                                                        |
| PRODUCTION_BE_SSH_PORT    | True      | Remote server SSH port number. Default 22.                                                                                                                                                                              |
| PRODUCTION_WORDPRESS_PATH | True      | Absolute path to WP root directory.                                                                                                                                                                                     |
| PRODUCTION_WORDPRESS_URL  | True      | Admin URL.                                                                                                                                                                                                              |
| PRODUCTION_NEXT_PATH      | False     | Mandatory if deploying Next.js to your own server. Absolute path to the parent folder of Next.js app. ⚠️ Parent folder because to reduce the downtime we deploy to `_new` folder, then swith with the `public` folder.  |
| PRODUCTION_NEXT_URL       | False     | Mandatory if deploying Next.js to your own server.                                                                                                                                                                      |

> ℹ️ Deployments are done automatically through Github workflows. By default Next.js is deployed to Vercel, but there is a custom action `.github/actions/deploy-next` to deploy it to a custom server.

## 🚀 Production deployments

When we push to the `production` git branch, Next.js and WordPress are automatically deployed to production.

```
Next.js   -> https://yourdomain.com
WordPress -> https://admin.yourdomain.com
```

See `.github/workflows/deploy-production.yml` for more details.

## 👁 Preview deployments

When we push to any branch, or for any Merge Request:

-   Next.js is deployed on a preview URL on Vercel
-   WordPress is ignored if not `main` branch and Next will consume data from WordPress Staging

```
Next.js   -> https://yoursite-git-yourbranch.vercel.app
WordPress -> https://admin-staging.yourdomain.com
```

## 🔨 Custom deployments

Duplicate `.github/workflows/deploy-production.yml` file and edit the secrets to deploy WordPress and/or Next to a specific instance.

Be sure to not forget to add the custom action secrets to Github.
