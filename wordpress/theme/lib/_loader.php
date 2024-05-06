<?php

namespace SUPT;

/**
 * THEME ENTRY POINT
 * =================
 */

require_once __DIR__ . '/SuptTheme.php';

/**
 * LIBRARIES
 * =========
 */
require_once __DIR__ . '/admin/_loader.php';
require_once __DIR__ . '/helpers/_loader.php';
require_once __DIR__ . '/post-types/_loader.php';
require_once __DIR__ . '/taxonomies/_loader.php';
require_once __DIR__ . '/graphql/_loader.php';
require_once __DIR__ . '/blocks/_loader.php';
require_once __DIR__ . '/editor/_loader.php'; // Needs to be after registering different block-types
