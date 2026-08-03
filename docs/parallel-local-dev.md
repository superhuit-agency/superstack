# Parallel local instances (git worktrees)

Run several isolated copies of the stack side by side — each with its own
WordPress port, MariaDB, uploads and Next.js dev server. Useful to test
different branches (or let agents test different things) simultaneously.

## Create an instance

From the main checkout:

```sh
sh scripts/create-worktree.sh 1            # uses the current branch
sh scripts/create-worktree.sh 2 origin/main
```

This creates `../<project>-wt<n>` (detached git worktree, named after your
checkout's folder), copies the heavy
gitignored dirs (`node_modules`, theme build, composer plugins) and generates
the instance config:

| File | Purpose |
| --- | --- |
| `wordpress/.env` | ports, docker project name, URLs, auto-login secret |
| `wordpress/wp-cli.local.yml` | points `wp @local` at this instance's container |
| `next/.env` | Next.js → this instance's WordPress |

Instance N uses: WordPress `:808N`, MariaDB `:3306N`, Next.js `:310N`. If one of
those ports is already taken the script walks up to the next free one and prints
a `NOTE:` — check the generated `wordpress/.env` for the ports actually used.

## Boot + seed it

`theme/static` is gitignored, so a new instance has no built theme assets until
you build them. `node_modules` is copied from the checkout you ran the script
from, so if those dependencies are older than the ref you checked out, run
`npm install` first — otherwise the build fails on a missing module:

```sh
cd ../<project>-wt1
(cd wordpress && npm run build)   # theme assets — skip and WordPress renders unstyled
(cd wordpress && npm start)

# copy content (DB + uploads) from the main checkout:
(cd /path/to/<project>/wordpress && sh scripts/db-snapshot.sh)
sh wordpress/scripts/db-seed.sh /path/to/<project>

(cd next && npm run dev -- -p 3101)
```

The database scripts refuse to run against a container belonging to a different
checkout — `PROJECT_CODE` defaults to `spck`, which every superstack-derived
project shares, so without that guard a snapshot taken in a checkout that has no
`wordpress/.env` would dump whichever project happens to own `spck_wp`.

## Auto-login (local only)

Each instance gets a random `DEV_AUTOLOGIN_SECRET` in `wordpress/.env`.
Visiting `http://localhost:808N/?dev_autologin=<secret>` logs you in as
administrator (see `wordpress/server/mu-plugins/dev-autologin.php`).
The mu-plugin is inert unless the env var is set by docker-compose, so it
cannot activate on staging/production.

## Tear down

```sh
(cd ../<project>-wt1/wordpress && npm stop)
git worktree remove ../<project>-wt1 --force
```

The main checkout keeps the default ports (`:80`, `:3306`, `:3000`) —
nothing changes for the regular workflow.
