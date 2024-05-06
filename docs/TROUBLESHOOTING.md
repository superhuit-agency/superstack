# Troubleshooting Guide

This troubleshooting guide is designed to help you identify and solve common issues you may encounter while using the boilerplate.

## Table of contents

1. [Common issues](#common-issues)

## Common issues

### 1. Handling fetch errors due to WordPress permalinks

#### Issue Overview:

Encountering fetch errors during page navigation in Next.js, post-update or installation.

#### Quick Fix:

This is a known issue and can be fixed by visiting the permalinks in the WordPress backoffice to flush the links _(ex: /graphql)_.

1. Go to `Settings > Permalinks`
2. click on the `Save Changes` button.

**Please Note**: Due to its origins in WordPress's architecture, this issue remains beyond the boilerplate's scope for a direct fix.

### 2. Error: Unexpected token '<' (<div id='e'... is not valid JSON) in getRedirection

This issue is because of the redirection table not existing in the Database. To fix it, you need to setup the Redirection plugin in Wordpress (In Tools > Redirection, then click on the Start Setup and follow the steps).