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

THEME_NAME=${THEME_NAME:="superstack"}

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
		echo $en "- Installing WordPress $ec"
		$WPCLI core install --url="http://localhost" --title="Superstack - Future" --admin_user="superhuit" --admin_password="superhuit" --admin_email="tech@superhuit.ch" --quiet &> /dev/null
		echo "✔"
	elif [ ! -f "$WORDPRESS_PATH/p.txt" ]; then
		echo "ERROR: WordPress does not seem to be installed. Add a file 'p.txt' containing the database password if you want this script to automatically install WordPress for you." 1>&2
		exit 1
	else
		# bail early if missing env vars
		[ -z "${WORDPRESS_VERSION}" ] && echo "ERROR: Please define WORDPRESS_VERSION environment variable" 1>&2 && exit 1
		[ -z "${WORDPRESS_LOCALE}" ] && echo "ERROR: Please define WORDPRESS_LOCALE environment variable" 1>&2 && exit 1
		[ -z "${WORDPRESS_DB_HOST}" ] && echo "ERROR: Please define WORDPRESS_DB_HOST environment variable" 1>&2 && exit 1
		[ -z "${WORDPRESS_DB_NAME}" ] && echo "ERROR: Please define WORDPRESS_DB_NAME environment variable" 1>&2 && exit 1
		[ -z "${WORDPRESS_DB_USER}" ] && echo "ERROR: Please define WORDPRESS_DB_USER environment variable" 1>&2 && exit 1
		[ -z "${WORDPRESS_URL}" ] && echo "ERROR: Please define WORDPRESS_URL environment variable" 1>&2 && exit 1
		[ -z "${WORDPRESS_TITLE}" ] && echo "ERROR: Please define WORDPRESS_TITLE environment variable (with no space character)" 1>&2 && exit 1
		[ -z "${WORDPRESS_ADMIN_USER}" ] && echo "ERROR: Please define WORDPRESS_ADMIN_USER environment variable" 1>&2 && exit 1
		[ -z "${WORDPRESS_ADMIN_EMAIL}" ] && echo "ERROR: Please define WORDPRESS_ADMIN_EMAIL environment variable" 1>&2 && exit 1
		# install
		echo $en "- Installing WordPress $ec"
		$WPCLI core download --version="$WORDPRESS_VERSION" --locale="$WORDPRESS_LOCALE"  --quiet &> /dev/null
		$WPCLI config create --dbhost="$WORDPRESS_DB_HOST" --dbname="$WORDPRESS_DB_NAME" --dbuser="$WORDPRESS_DB_USER" --prompt=dbpass < $WORDPRESS_PATH/p.txt  --quiet &> /dev/null
		$WPCLI core install --url="$WORDPRESS_URL" --title="$WORDPRESS_TITLE" --admin_user="$WORDPRESS_ADMIN_USER" --admin_email="$WORDPRESS_ADMIN_EMAIL"  --quiet &> /dev/null
		rm $WORDPRESS_PATH/p.txt
		echo "✔"
	fi
fi

# update theme if new version available
if [ -d "$WORDPRESS_PATH/wp-content/themes/_new" ]; then
	[ -d "$WORDPRESS_PATH/wp-content/themes/$THEME_NAME" ] && mv "$WORDPRESS_PATH/wp-content/themes/$THEME_NAME" "$WORDPRESS_PATH/wp-content/themes/_old"
	mv "$WORDPRESS_PATH/wp-content/themes/_new" "$WORDPRESS_PATH/wp-content/themes/$THEME_NAME" && rm -rf "$WORDPRESS_PATH/wp-content/themes/_old"
fi

echo
echo "----------------------------------"
echo "  Theme install & configuration   "
echo "----------------------------------"
echo

if ! $($WPCLI theme is-active $THEME_NAME --skip-plugins); then
	echo $en "- Activate theme $ec"
	$WPCLI theme activate "$THEME_NAME" --skip-plugins --quiet
	echo "✔"
else
	echo "- Theme already active"
fi

echo $en "- Uninstalling default themes $ec"
$WPCLI theme uninstall twentytwentythree --quiet &> /dev/null
$WPCLI theme uninstall twentytwentyfour --quiet &> /dev/null
$WPCLI theme uninstall twentytwentyfive --quiet &> /dev/null
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

echo
echo "----------------------------------"
echo "        Roles & Capabilities      "
echo "----------------------------------"
echo

# Grant capabilities to editor role
echo $en "- Grant capabilities to editor role $ec"
$WPCLI cap add editor edit_theme_options --quiet &> /dev/null
$WPCLI cap add editor create_users --quiet &> /dev/null
$WPCLI cap add editor delete_users --quiet &> /dev/null
$WPCLI cap add editor edit_users --quiet &> /dev/null
$WPCLI cap add editor list_users --quiet &> /dev/null
$WPCLI cap add editor promote_users --quiet &> /dev/null
$WPCLI cap add editor remove_users  --quiet &> /dev/null
$WPCLI cap add editor ure_create_capabilities --quiet &> /dev/null
$WPCLI cap add editor ure_create_roles --quiet &> /dev/null
$WPCLI cap add editor ure_delete_roles --quiet &> /dev/null
$WPCLI cap add editor ure_edit_roles --quiet &> /dev/null
$WPCLI cap add editor ure_manage_options --quiet &> /dev/null
$WPCLI cap add editor ure_reset_roles   --quiet &> /dev/null

# Grant editors access to Content Control restrictions
echo $en "- Adding manage_content_control_restriction cap to editor role $ec"
$WPCLI cap add editor manage_content_control_restriction --quiet &> /dev/null
echo "✔"

echo $en "- Configuring Content Control permissions $ec"
$WPCLI option patch update content_control_settings permissions '{"edit_restrictions":"manage_content_control_restriction"}' --format=json --quiet &> /dev/null
echo "✔"

echo
echo "----------------------------------"
echo "          Other configs           "
echo "----------------------------------"
echo

# Disable major updates
if [ -z $($WPCLI config get "WP_AUTO_UPDATE_CORE") ]; then
	$WPCLI config set "WP_AUTO_UPDATE_CORE" "minor"
fi

# Setup redirection tables
$WPCLI redirection database install --quiet &> /dev/null
$WPCLI redirection database upgrade --quiet &> /dev/null

# YOAST options
## Disable XML sitemap
$WPCLI option patch update wpseo enable_xml_sitemap false --quiet &> /dev/null
## hide meta box for press review post type
$WPCLI option patch update wpseo_titles noindex-press_review false --quiet &> /dev/null
$WPCLI option patch update wpseo_titles noindex-ptarchive-press_review false --quiet &> /dev/null
$WPCLI option patch update wpseo_titles display-metabox-pt-press_review false --quiet &> /dev/null

## hide meta box for member post type
$WPCLI option patch update wpseo_titles noindex-member false --quiet &> /dev/null
$WPCLI option patch update wpseo_titles noindex-ptarchive-member false --quiet &> /dev/null
$WPCLI option patch update wpseo_titles display-metabox-pt-member false --quiet &> /dev/null

## hide meta box for partner post type
$WPCLI option patch update wpseo_titles noindex-partner false --quiet &> /dev/null
$WPCLI option patch update wpseo_titles noindex-ptarchive-partner false --quiet &> /dev/null
$WPCLI option patch update wpseo_titles display-metabox-pt-partner false --quiet &> /dev/null

# Disable comments system
$WPCLI option update disable_comments_options '{"disabled_post_types":["post","page","event","attachment"],"remove_everywhere":true,"permanent":false,"extra_post_types":false,"db_version":6}' --format=json

# Nested pages configs
$WPCLI option update nestedpages_menusync nosync --quiet &> /dev/null
$WPCLI option update nestedpages_menu '' --quiet &> /dev/null
$WPCLI option update nestedpages_disable_menu true --quiet &> /dev/null
$WPCLI option update nestedpages_allowsorting '{"administrator","editor"}' --format=json --quiet &> /dev/null

# Forminator appearance presets
$WPCLI option update forminator_appearance_preset_default --format=json '{"form-border-style":"solid","form-padding":"","form-border":"","fields-style":"open","field-image-size":"custom","form-style":"default","form-substyle":"material","indicator-label":"Soumission en cours\u2026","cform-color-option":"theme","basic-field-image-size":"custom","basic-fields-style":"open","input-focus-outline-color":"#254DEB","radio-border-hover":"#097BAA","radio-background-hover":"#E1F6FF","select-focus-outline-color":"#254DEB","button-submit-focus-outline-color":"#254DEB","prev-focus-outline-color":"#254DEB","next-focus-outline-color":"#254DEB","button-upload-focus-outline-color":"#254DEB","button-upload-delete-focus-outline-color":"#254DEB","multiupload-panel-focus-outline-color":"#254DEB","multiupload-panel-link-focus-outline-color":"#254DEB","repeater-icon-outline-focus":"#254DEB","consent-cbox-border-hover":"#254DEB","consent-cbox-background-hover":"#254DEB","slider-handle-outline-color":"#254DEB","rating-focus-outline-color":"#254DEB"}'

$WPCLI rewrite structure '/actualites/%postname%/'
$WPCLI rewrite flush --hard --quiet

# Update WP translations
$WPCLI language core update --quiet &> /dev/null

# Clear transients & theme files patterns cache
$WPCLI transient delete --all
$WPCLI db query "DELETE FROM wp_options where option_name LIKE '%wp_theme_files_patterns%'"

# Run database migrations
echo
echo "----------------------------------"
echo "          Migrations              "
echo "----------------------------------"
echo

PENDING=$($WPCLI spck migrate --pending-count)
if [ "$PENDING" -gt 0 ]; then
	BACKUP_FILE="$WORDPRESS_PATH/db-backup-$(date +%Y%m%d_%H%M%S).sql"
	echo $en "- $PENDING pending migration(s), backing up database $ec"
	$WPCLI db export "$BACKUP_FILE" --quiet
	echo "✔ ($BACKUP_FILE)"
	echo

	$WPCLI spck migrate
else
	echo "- No pending migrations"
fi

echo
echo "----------------------------------"
echo "       Installation complete      "
echo "----------------------------------"
