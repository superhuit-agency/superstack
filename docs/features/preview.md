# 👁 Preview

When you visit a WordPress page or article (click "View" or "Preview" in Dashboard), you get automatically redirected to the correct page/post in Next.js, in [Draft Mode](https://nextjs.org/docs/app/building-your-application/configuring/draft-mode).

While in Draft Mode, GraphQL queries from Next.js can be authenticated as the current WordPress user. This way, you will see the latest revisions/drafts right in Next.js without affecting the public (static) page.

If it works, you should see "_This page is a preview._" on the Preview Toolbar at the bottom of the page.

#### Technical details

This happens thanks to some magic in `wordpress/theme/index.php`, `src/app/api/preview` and `src/lib`, in summary:

1.  WordPress redirects to `{NEXT_URL}/api/preview/?secret={WORDPRESS_PREVIEW_SECRET}&id={post_ID}&token={auth_token}`
2.  Next.js `/api/preview` endpoint takes care of checking authentication, activating Next.js Draft Mode, and redirecting to the uri of the page (or to /{id} if no uri yet, i.e. Drafts)
