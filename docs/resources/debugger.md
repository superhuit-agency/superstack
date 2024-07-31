# Debugger

The stack includes configurations to debug with VSCode.

It is possible to use the step-by-step debugger for:

1.  [WordPress PHP files](#wordpress-php-file-debugging)
2.  Next.js
    -   [Client-side](#nextjs-client-side-debugging)
    -   [Server-side](#nextjs-server-side-debugging)
    -   [Full stack](#nextjs-full-stack-debugging)
3.  [Storybook](#storybook-debugging)

> ℹ️ Learn more about [debugging with VSCode](https://code.visualstudio.com/Docs/editor/debugging)

## WordPress PHP file debugging

To debug WordPress PHP file using Xdebug:

1. Set breakpoints in your WordPress PHP files.
2. Start debugging in VSCode by selecting the "Listen for Xdebug on Docker" configuration and clicking the "Start Debugging" button (or press F5).
3. Interact with your WordPress site to trigger the breakpoints.

## Next.js client-side debugging

To debug Next.js client-side code:

1. Make sure next.js is already running in dev mode `npm run dev`
2. Set breakpoints in your client-side Next.js code.
3. Start debugging in VSCode by selecting the "Next.js: debug client-side" configuration and clicking the "Start Debugging" button (or press F5).
4. A Chrome window will automatically opens, you can now interact with your Next.js app to trigger the breakpoints.

## Next.js server-side debugging

To debug Next.js server-side code:

1. Make sure Next.js is not running
2. Set breakpoints in your server-side Next.js code (e.g., in getServerSideProps, or getData functions).
3. Start debugging in VSCode by selecting the "Next.js: debug server-side" configuration and clicking the "Start Debugging" button (or press F5).
4. Trigger server-side rendering by navigating to pages in your Next.js app.

## Next.js full stack debugging

To debug both server-side and client-side simultaneously:

1. Make sure Next.js is not running
2. Set breakpoints in both server-side and client-side code.
3. Start debugging in VSCode by selecting the "Next.js: debug full stack" configuration and clicking the "Start Debugging" button (or press F5).
4. A Chrome window will automatically opens, you can now interact with your Next.js app to trigger the breakpoints on both sides.

## Storybook Debugging

To debug Storybook:

1. Make sure Storybook is already running `npm run storybook`
2. Set breakpoints in your Storybook stories or components.
3. Start debugging in VSCode by selecting the "Storybook: debug" configuration and clicking the "Start Debugging" button (or press F5).
4. A Chrome window will automatically opens, you can now interact with your Storybook components to trigger the breakpoints.

> 🎯 Remember to have the necessary dependencies installed and your development environment properly set up before starting debugging sessions. If you encounter any issues, double-check your environment variables and Docker configurations.
