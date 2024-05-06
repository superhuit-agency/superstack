<?php

namespace SUPT\Blocks;

// Avoid blocks parsing on admin area
if ( is_admin() ) return;

require_once __DIR__.'/block-parser.php';
require_once __DIR__.'/reusable-block.php';
