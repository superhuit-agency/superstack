# Revalidate Cache

We created a WP plugin ([Next.js Revalidate](https://github.com/superhuit-agency/nextjs-revalidate)) to purge & re-build the cached pages from the WordPress admin area.<br />
It also automatically purges & re-builds when a page/post/... is saved or updated.

> Based on the Next.js [On-demand revalidation](https://nextjs.org/docs/app/building-your-application/caching#on-demand-revalidation) documentation

The revalidation request will be sent to the configured URL endpoint with two query arguments :

1. The relative `path` to revalidate
2. The `secret` to protect the revalidation endpoint.

### Example

```
https://example.com/api/revalidate?path=/hello-world/&secret=my-secret-string
```

### Configuration

To configure this plugin here are the steps to follow :

1. Activate _Next.js Revalidate_ plugin in the WP Admin
2. In Settings > Next.js revalidate (on WP Admin) set the different settings :
    1. **Revalidate url** => https://example.com/api/revalidate
    2. **Revalidate Secret** => you can use https://www.uuidgenerator.net/ to generate one
3. Set the `REVALIDATE_SECRET` environment variable to that same Revalidate Secret on Next.js server.

> _Note:_ It's important to note that the revalidation doesn't work if you run the project on your local.
