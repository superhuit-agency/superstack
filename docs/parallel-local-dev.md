# Parallel local instances (git worktrees)

Run several isolated copies of the stack side by side — each with its own
WordPress port, MariaDB, uploads and Next.js dev server — so different branches
(or people, or agents) can be worked on simultaneously.

Instance N uses WordPress `:808N`, MariaDB `:3306N`, Next.js `:310N`. Setup
fails rather than shifting if a port is taken, so instance numbers stay
predictable. The main checkout keeps `:80`/`:3306`/`:3000` and is unaffected.

```sh
sh scripts/create-worktree.sh 1                  # create ../<project>-wt1
cd ../<project>-wt1
(cd wordpress && npm install && npm run build)   # theme assets
(cd wordpress && npm start)
(cd next && PORT=3101 npm run dev)
```

`npm install` first: dependencies are copy-on-write cloned from the checkout you
ran the script from and may be older than the ref you checked out. Compiled
theme assets are deliberately not copied — one branch's build in another
branch's worktree renders a site that looks correct and is not.

`PORT=` is required: `next dev` reads it from the process environment, not from
`next/.env`, so a bare `npm run dev` binds `:3000` in every instance.

## Copy content from another instance

```sh
sh wordpress/scripts/db-seed.sh /path/to/<project>
```

Both instances must be running. Exports the source database into this one,
rewrites stored URLs to this instance's ports, and rsyncs its uploads.

The instance scripts refuse to act on a container belonging to a different
checkout — `PROJECT_CODE` defaults to `spck`, which every superstack-derived
project shares, so without that check an unconfigured checkout would act on
whichever project currently owns `spck_wp`.

## Auto-login (local only)

Visiting `http://localhost:808N/?dev_autologin=<secret>` logs you in as
administrator, using the random `DEV_AUTOLOGIN_SECRET` in `wordpress/.env`.
The mu-plugin is inert unless that variable is set by the local
docker-compose, and neither the Dockerfile nor the deploy workflow ships
`wordpress/server/mu-plugins/`, so it cannot activate on a real server.

Treat the secret and the auto-login URL as an admin credential — keep them out
of shared logs, tickets and transcripts.

## Tear down

```sh
(cd ../<project>-wt1/wordpress && npm stop)
git worktree remove ../<project>-wt1 --force
```
