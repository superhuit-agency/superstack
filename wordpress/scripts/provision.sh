#!/bin/sh

#===========================================
# Provisioning script
#===========================================
#
# This script has 3 purposes:
# - easy install of wp on a new server
# - provision wordpress with default configs
# - easy update of theme/plugins/configs on
#   each deployment
#
# USAGE:
# * To install wordpress on a new server:
#   Add a file $WORDPRESS_PATH/p.txt containing the
#   MySQL password and run this script.
#
# * To update the theme with 0-downtime:
#   Deploy your new theme version
#   in $WORDPRESS_PATH/wp-content/themes/_new
#   then run this script.
#
# IMPORTANT DEV NOTES:
# * This script should be idempotent, meaning
#   it can be run repeatedly without making
#   any damage.
#
# * Edit only the variables below
#
#===========================================

IS_MULTILANG=${IS_MULTILANG:=false}
HTTP_HOST=${WORDPRESS_URL}

# #===========================================
# # /!\ STOP to edit here /!\
# #===========================================

# vars
if [ -z "${WORDPRESS_PATH}" ]; then
	echo "ERROR: Please define WORDPRESS_PATH environment variable" 1>&2
	exit 1
fi

if [ "`echo -n`" = "-n" ]; then
  en=""
  ec="\c"
else
  en="-n"
  ec=""
fi

## define wp-cli command if undefined and install if needed
if [ -z "${WPCLI}" ]; then
	if [ -x "$(command -v wp)" ]; then
		# wp-cli binary exists
		WPCLI="wp --path=""$WORDPRESS_PATH"""
	else
		# wp-cli binary not existing: download
		WPCLI="php wp-cli.phar --path=""$WORDPRESS_PATH"""
		[ ! -f wp-cli.phar ] && curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
	fi
fi


# install wp (if not installed)
# /!\ dev note: don't write anything in the folder before this or it will fail, saying 'the folder is not empty'
if ! $WPCLI core is-installed --quiet &> /dev/null; then
	echo
	echo "----------------------------------"
	echo "     WordPress installation       "
	echo "----------------------------------"
	echo
	if [ ! -z "${WORDPRESS_ENV}" ] && [ "${WORDPRESS_ENV}" = "dev" ]; then # we are on local dev environment (in docker)
		echo $en "- Installing WordPress as localhost $ec"
		$WPCLI core install --url="http://localhost" --title="superstack" --admin_user="superstack" --admin_password="superstack" --admin_email="tech+superstack@superhuit.ch" --quiet &> /dev/null
		echo "✔"
	elif [ ! -f "$WORDPRESS_PATH/p.txt" ]; then
		echo "ERROR: WordPress does not seem to be installed. Add a file 'p.txt' containing the database password if you want this script to automatically install WordPress for you." 1>&2
		exit 1
	else
		# bail early if missing env vars
		[ -z "${WORDPRESS_ADMIN_USER}" ] && echo "ERROR: Please define WORDPRESS_ADMIN_USER environment variable" 1>&2 && exit 1
		[ -z "${WORDPRESS_ADMIN_EMAIL}" ] && echo "ERROR: Please define WORDPRESS_ADMIN_EMAIL environment variable" 1>&2 && exit 1
		[ -z "${WORDPRESS_DB_HOST}" ] && echo "ERROR: Please define WORDPRESS_DB_HOST environment variable" 1>&2 && exit 1
		[ -z "${WORDPRESS_DB_NAME}" ] && echo "ERROR: Please define WORDPRESS_DB_NAME environment variable" 1>&2 && exit 1
		[ -z "${WORDPRESS_DB_USER}" ] && echo "ERROR: Please define WORDPRESS_DB_USER environment variable" 1>&2 && exit 1
		[ -z "${WORDPRESS_LOCALE}" ] && echo "ERROR: Please define WORDPRESS_LOCALE environment variable" 1>&2 && exit 1
		[ -z "${WORDPRESS_PATH}" ] && echo "ERROR: Please define WORDPRESS_PATH environment variable" 1>&2 && exit 1
		[ -z "${WORDPRESS_THEME_NAME}" ] && echo "ERROR: Please define WORDPRESS_THEME_NAME environment variable (no space)" 1>&2 && exit 1
		[ -z "${WORDPRESS_THEME_TITLE}" ] && echo "ERROR: Please define WORDPRESS_THEME_TITLE environment variable" 1>&2 && exit 1
		[ -z "${WORDPRESS_URL}" ] && echo "ERROR: Please define WORDPRESS_URL environment variable" 1>&2 && exit 1
		[ -z "${WORDPRESS_VERSION}" ] && echo "ERROR: Please define WORDPRESS_VERSION environment variable" 1>&2 && exit 1
		# install

		if $WPCLI core is-installed --quiet; then
			echo $en "- Installing WordPress $ec"
			$WPCLI core download --version="$WORDPRESS_VERSION" --locale="$WORDPRESS_LOCALE"  --quiet &> /dev/null
			$WPCLI config create --dbhost="$WORDPRESS_DB_HOST" --dbname="$WORDPRESS_DB_NAME" --dbuser="$WORDPRESS_DB_USER" --prompt=dbpass < $WORDPRESS_PATH/p.txt  --quiet &> /dev/null
			$WPCLI core install --version="$WORDPRESS_VERSION" --locale="$WORDPRESS_LOCALE" --url="$WORDPRESS_URL" --title="$WORDPRESS_THEME_TITLE" --admin_user="$WORDPRESS_ADMIN_USER" --admin_email="$WORDPRESS_ADMIN_EMAIL"
			rm $WORDPRESS_PATH/p.txt
			echo "✔"
		else
			# Check if current WordPress version matches requested version
			CURRENT_VERSION=$($WPCLI core version --quiet)
			if [ "$CURRENT_VERSION" != "$WORDPRESS_VERSION" ]; then
				echo $en "- Updating WordPress from $CURRENT_VERSION to $WORDPRESS_VERSION $ec"
				$WPCLI core update --version="$WORDPRESS_VERSION" --force --quiet &> /dev/null
				echo "✔"
			else
				echo "- WordPress version $WORDPRESS_VERSION already installed"
			fi
		fi
	fi
fi

# update theme if new version available
if [ -d "$WORDPRESS_PATH/wp-content/themes/_new" ]; then
	[ -d "$WORDPRESS_PATH/wp-content/themes/$WORDPRESS_THEME_NAME" ] && mv "$WORDPRESS_PATH/wp-content/themes/$WORDPRESS_THEME_NAME" "$WORDPRESS_PATH/wp-content/themes/_old"
	mv "$WORDPRESS_PATH/wp-content/themes/_new" "$WORDPRESS_PATH/wp-content/themes/$WORDPRESS_THEME_NAME" && rm -rf "$WORDPRESS_PATH/wp-content/themes/_old"
fi

echo
echo "----------------------------------"
echo "  Theme install & configuration   "
echo "----------------------------------"
echo

if ! $($WPCLI theme is-active $WORDPRESS_THEME_NAME --skip-plugins); then
	echo $en "- Activate theme $ec"
	$WPCLI theme activate "$WORDPRESS_THEME_NAME" --skip-plugins --quiet
	echo "✔"
else
	echo "- Theme already active"
fi

echo $en "- Uninstalling default themes $ec"
$WPCLI theme uninstall twentytwenty --quiet &> /dev/null
$WPCLI theme uninstall twentytwentyone --quiet &> /dev/null
$WPCLI theme uninstall twentytwentytwo --quiet &> /dev/null
$WPCLI theme uninstall twentytwentythree --quiet &> /dev/null
$WPCLI theme uninstall twentytwentyfour --quiet &> /dev/null
echo "✔"

echo
echo "----------------------------------"
echo "            Plugins               "
echo "----------------------------------"
echo

echo $en "- Uninstalling default plugins $ec"
$WPCLI plugin uninstall hello --deactivate --quiet &> /dev/null
$WPCLI plugin uninstall akismet --deactivate --quiet &> /dev/null
echo "✔"

echo $en "- Activating plugins $ec"
$WPCLI plugin activate $($WPCLI plugin list --status=inactive --field=name --skip-update-check) --quiet &> /dev/null
echo "✔"

# Multilang
__dir="$(dirname "${BASH_SOURCE[0]:-$0}")"
if [ "$IS_MULTILANG" = true ]; then
	echo $en "- Activating multilang plugins $ec"
	if ! $WPCLI plugin is-active polylang; then $WPCLI plugin activate "polylang" --quiet &> /dev/null; fi
	if ! $WPCLI plugin is-active acf-options-for-polylang; then $WPCLI plugin activate "acf-options-for-polylang" --quiet &> /dev/null; fi
	if ! $WPCLI plugin is-active wp-graphql-polylang; then $WPCLI plugin activate "wp-graphql-polylang" --quiet &> /dev/null; fi
	if ! $WPCLI plugin is-active starterpack-i18n; then $WPCLI plugin activate "starterpack-i18n" --quiet &> /dev/null; fi
	echo "✔"
else
	echo $en "- Deactivating multilang plugins $ec"
	if $WPCLI plugin is-active acf-options-for-polylang; then $WPCLI plugin deactivate "acf-options-for-polylang" --quiet &> /dev/null; fi
	if $WPCLI plugin is-active wp-graphql-polylang; then $WPCLI plugin deactivate "wp-graphql-polylang" --quiet &> /dev/null; fi
	if $WPCLI plugin is-active starterpack-i18n; then $WPCLI plugin deactivate "starterpack-i18n" --quiet &> /dev/null; fi
	if $WPCLI plugin is-active polylang; then $WPCLI plugin deactivate "polylang" --quiet &> /dev/null; fi
	echo "✔"
fi

echo
echo "----------------------------------"
echo "          Other configs           "
echo "----------------------------------"
echo

# Setup redirection tables
$WPCLI redirection database install --quiet &> /dev/null
$WPCLI redirection database upgrade --quiet &> /dev/null

# Update WP translations
$WPCLI language core update --quiet &> /dev/null

# YOAST options
# $WPCLI option update wpseo_titles true
# $WPCLI option update breadcrumbs-enable true

# Disable comments system
$WPCLI option update disable_comments_options '{"disabled_post_types":["post","page","event","attachment"],"remove_everywhere":true,"permanent":false,"extra_post_types":false,"db_version":6}' --format=json

# ONLY FOR DEV ENV
if [ ! -z "${WORDPRESS_ENV}" ] && [ "${WORDPRESS_ENV}" = "dev" ]; then
	# Enables WP-GraphQL introspection for VSCode to be able to get graphql schema for autocompletion
	$WPCLI option update graphql_general_settings --format=json '{"graphql_endpoint":"graphql","restrict_endpoint_to_logged_in_users":"off","batch_queries_enabled":"on","batch_limit":"10","query_depth_enabled":"off","query_depth_max":"10","graphiql_enabled":"on","show_graphiql_link_in_admin_bar":"on","delete_data_on_deactivate":"on","debug_mode_enabled":"off","tracing_enabled":"off","tracing_user_role":"administrator","query_logs_enabled":"off","query_log_user_role":"administrator","public_introspection_enabled":"on"}'
fi

# Add Next.js url
if [ ! -z "${NEXT_URL}" ]; then
	$WPCLI option update next_url "$NEXT_URL"
fi

# Add Forms secret
if [ ! -z "${WORDPRESS_FORMS_SECRET}" ]; then
	$WPCLI option update forms_secret "$WORDPRESS_FORMS_SECRET"
fi

# Add GraphQL JWT Auth Key
if [ ! -z "${WORDPRESS_GRAPHQL_JWT_AUTH_SECRET_KEY}" ]; then
	$WPCLI config set GRAPHQL_JWT_AUTH_SECRET_KEY "$WORDPRESS_GRAPHQL_JWT_AUTH_SECRET_KEY"
fi

# Add hCaptcha Secret Key
if [ ! -z "${WORDPRESS_HCAPTCHA_SECRET}" ]; then
	$WPCLI config set forms_hcaptcha_secret "$WORDPRESS_HCAPTCHA_SECRET"
fi

# Disable major updates
if [ -z $($WPCLI config get "WP_AUTO_UPDATE_CORE") ]; then
	$WPCLI config set "WP_AUTO_UPDATE_CORE" "minor"
fi

# Update Sample Page to be the Home
# $WPCLI post update 2 --post_title="Home" --post_content='<!-- wp:heading {"level":1} --><h1 class="wp-block-heading">Home</h1><!-- /wp:heading -->'
# $WPCLI option update show_on_front page
# $WPCLI option update page_on_front 2

# Add WP Graphql Gutenberg Registry if not yet registered in the db (=> avoids Vercel first deployment to fail)
$WPCLI option get wp_graphql_gutenberg_block_types &> /dev/null
if [ $? -ne 0 ]; then
	$WPCLI option add wp_graphql_gutenberg_block_types --format=json '{"core/paragraph":{"name":"core/paragraph","keywords":["text"],"attributes":{"align":{"type":"string"},"content":{"type":"string","source":"html","selector":"p","default":"","__experimentalRole":"content"},"dropCap":{"type":"boolean","default":false},"placeholder":{"type":"string","default":"Start writing"},"direction":{"type":"string","enum":["ltr","rtl"]},"lock":{"type":"object"},"style":{"type":"object"},"backgroundColor":{"type":"string"},"textColor":{"type":"string"},"gradient":{"type":"string"},"className":{"type":"string"},"fontSize":{"type":"string"},"fontFamily":{"type":"string"},"anchor":{"type":"string","source":"attribute","attribute":"id","selector":"*"},"isPreview":{"type":"boolean","default":false}},"providesContext":[],"usesContext":[],"supports":{"anchor":true,"className":false,"color":{"gradients":true,"link":true,"__experimentalDefaultControls":{"background":true,"text":true}},"spacing":{"margin":true,"padding":true},"typography":{"fontSize":true,"lineHeight":true,"__experimentalFontFamily":true,"__experimentalTextDecoration":true,"__experimentalFontStyle":true,"__experimentalFontWeight":true,"__experimentalLetterSpacing":true,"__experimentalTextTransform":true,"__experimentalDefaultControls":{"fontSize":true}},"__experimentalSelector":"p","__unstablePasteTextInline":true},"styles":[],"variations":[],"apiVersion":2,"title":"Paragraph","description":"Start with the basic building block of all narrative.","category":"text","example":{"name":"core/paragraph","attributes":{"isPreview":true}},"deprecated":[{"supports":{"className":false},"attributes":{"align":{"type":"string"},"content":{"type":"string","source":"html","selector":"p","default":""},"dropCap":{"type":"boolean","default":false},"placeholder":{"type":"string","default":"Start writing"},"textColor":{"type":"string"},"backgroundColor":{"type":"string"},"fontSize":{"type":"string"},"direction":{"type":"string","enum":["ltr","rtl"]},"customTextColor":{"type":"string"},"customBackgroundColor":{"type":"string"},"customFontSize":{"type":"number"},"lock":{"type":"object"},"className":{"type":"string"},"isPreview":{"type":"boolean","default":false}}},{"supports":{"className":false},"attributes":{"align":{"type":"string"},"content":{"type":"string","source":"html","selector":"p","default":""},"dropCap":{"type":"boolean","default":false},"placeholder":{"type":"string","default":"Start writing"},"textColor":{"type":"string"},"backgroundColor":{"type":"string"},"fontSize":{"type":"string"},"direction":{"type":"string","enum":["ltr","rtl"]},"customTextColor":{"type":"string"},"customBackgroundColor":{"type":"string"},"customFontSize":{"type":"number"},"lock":{"type":"object"},"className":{"type":"string"},"isPreview":{"type":"boolean","default":false}}},{"supports":{"className":false},"attributes":{"align":{"type":"string"},"content":{"type":"string","source":"html","selector":"p","default":""},"dropCap":{"type":"boolean","default":false},"placeholder":{"type":"string","default":"Start writing"},"textColor":{"type":"string"},"backgroundColor":{"type":"string"},"fontSize":{"type":"string"},"direction":{"type":"string","enum":["ltr","rtl"]},"customTextColor":{"type":"string"},"customBackgroundColor":{"type":"string"},"customFontSize":{"type":"number"},"lock":{"type":"object"},"className":{"type":"string"},"isPreview":{"type":"boolean","default":false}}},{"supports":{"className":false},"attributes":{"align":{"type":"string"},"content":{"type":"string","source":"html","selector":"p","default":""},"dropCap":{"type":"boolean","default":false},"placeholder":{"type":"string","default":"Start writing"},"textColor":{"type":"string"},"backgroundColor":{"type":"string"},"fontSize":{"type":"string"},"direction":{"type":"string","enum":["ltr","rtl"]},"customTextColor":{"type":"string"},"customBackgroundColor":{"type":"string"},"customFontSize":{"type":"number"},"width":{"type":"string"},"lock":{"type":"object"},"className":{"type":"string"},"isPreview":{"type":"boolean","default":false}}},{"supports":{"className":false},"attributes":{"align":{"type":"string"},"content":{"type":"string","source":"html","selector":"p","default":""},"dropCap":{"type":"boolean","default":false},"placeholder":{"type":"string","default":"Start writing"},"textColor":{"type":"string"},"backgroundColor":{"type":"string"},"fontSize":{"type":"number"},"direction":{"type":"string","enum":["ltr","rtl"]},"lock":{"type":"object"},"className":{"type":"string"},"isPreview":{"type":"boolean","default":false}}},{"supports":{"className":false},"attributes":{"align":{"type":"string"},"content":{"type":"string","source":"html","default":""},"dropCap":{"type":"boolean","default":false},"placeholder":{"type":"string","default":"Start writing"},"textColor":{"type":"string"},"backgroundColor":{"type":"string"},"fontSize":{"type":"string"},"direction":{"type":"string","enum":["ltr","rtl"]},"style":{"type":"object"},"lock":{"type":"object"},"className":{"type":"string"},"isPreview":{"type":"boolean","default":false}}}]}}'
fi

$WPCLI rewrite structure '/blog/%postname%/'
$WPCLI rewrite flush --hard --quiet

echo
echo "----------------------------------"
echo "       Installation complete      "
echo "----------------------------------"
