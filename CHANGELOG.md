# Changelog

## 1.2.0 - 2024-09-18

### Plugins and dependencies update:

The following packages were added to the next project

```
"@marker.io/browser": "0.19.0",
"@react-hookz/web": "24.0.4",
"@types/matter-js": "0.19.6",
"framer-motion": "10.17.12",
"lottie-react": "2.4.0",
"matter-js": "0.19.0",
"nodemailer": "6.9.8",
"@types/wordpress__blob": "2.8.0",
"@types/wordpress__components": "23.0.11",
"@types/wordpress__dom-ready": "2.9.0",
```

The following packages were added to the wordpress project:

```
"advanced-custom-fields/advanced-custom-fields-pro": "6.3.6",
"user-role-editor/user-role-editor-pro": "4.64.2",
"wpackagist-plugin/wpgraphql-acf": "2.4.1",
```

### Dynamic next config

Next config + next.utils are more generic (so far for the image domains) and use now a new env variable:

```
NEXT_EXTRA_CONTENT_DOMAINS=["placeholder.pics", "superstack.superhuit.ch"]
```

## 1.1.1 - 2024-08-26

Demo changes

## 1.1.0 - 2024-08-22

Test Minor update

## 1.0.1 - 2024-08-22

Implementing CI scripts for better code quality

### Miscanellous

-   CI scripts for pull requests
-   First unit tests with JEST for CI validation

## 1.0.0 - 2024-05-07

_Initial release._
