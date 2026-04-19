# Get GraphQL Linter / Syntax Highlighting

## Update settings of WPGraphQL Plugin

**/!\ On dev env only<br />**
On WPGraphQL General Settings page, make sure `Restrict Endpoint to Authenticated Users` is disabled, and `Enable Public Introspection` is enabled.

## Generate GraphQL Schema locally

-   Make sure you have `graphql-cli` installed globally (you can install it with `npm install -g graphql-cli`)
-   Make sure WP is running (you can access to [http://localhost/graphql](http://localhost/graphql))
-   Generate the GraphQL Schema locally by running `graphql get-schema`

GraphQL Linter should now be available within any `gql` query within the `data.ts` files

## `blocksJSON` vs `blocks` (WPGraphQL Gutenberg)

If your goal is to render **all blocks with unknown nesting depth**, prefer `blocksJSON`.

-   `blocksJSON`:
    -   one field, complete tree (including deep `innerBlocks`)
    -   stable query shape
    -   parse cost is moved to your app (JSON parsing + mapping)
-   `blocks`:
    -   typed GraphQL fields (`name`, `attributes`, `innerBlocks`, etc.)
    -   requires hardcoded nesting depth in the query
    -   deeper queries usually increase resolver work and payload size

In this starter, templates request `blocksJSON` and then enrich blocks server-side (`formatBlocksJSON`), which is generally the safest default for unknown depth.

### How to measure (recommended)

Benchmark both approaches on the **same content** (light page + heavy nested page):

1. Run each query 20-50 times (warm cache first, then measure).
2. Record:
    - server execution time (GraphQL debug tools / logs)
    - response size in bytes
    - client parsing time (`JSON.parse` + formatting for `blocksJSON`)
    - end-to-end TTFB
3. Compare p50 and p95 (not only averages).

Practical rule:

-   Need the full block tree reliably -> use `blocksJSON`.
-   Need only a small, known subset of shallow fields -> use `blocks` with limited depth.

### Before / After benchmark script

Use this script to measure the impact of a change you apply to the API's `blocksJSON` output.
It runs the **before** measurements, then waits for you to apply your changes, and on approval runs the **after** measurements with the exact same query.

**Requirements:** `curl` and `jq` must be available (`brew install jq` / `apt-get install -y jq`).

```bash
#!/usr/bin/env bash
# Usage:
#   WP_GQL=http://localhost/graphql PAGE_URI=/your-page/ bash bench-blocksjson-diff.sh
#   RUNS=30 WP_GQL=http://localhost/graphql PAGE_URI=/your-page/ bash bench-blocksjson-diff.sh

WP_GQL="${WP_GQL:-http://localhost/graphql}"
PAGE_URI="${PAGE_URI:-/}"
RUNS="${RUNS:-20}"

QUERY='{ nodeByUri(uri: "'"$PAGE_URI"'") { ... on Page { blocksJSON } } }'

if ! command -v jq &>/dev/null; then
  echo "jq is required. Install with: brew install jq  OR  apt-get install -y jq"
  exit 1
fi

# ── helper ────────────────────────────────────────────────────────────────────
# run_bench LABEL  →  sets BENCH_AVG, BENCH_P50, BENCH_P95, BENCH_AVG_SIZE
run_bench() {
  local label="$1"
  local times=()
  local sizes=()

  echo ""
  echo "=== $label ==="
  echo "    endpoint : $WP_GQL"
  echo "    page     : $PAGE_URI"
  echo "    runs     : $RUNS  (+ 1 warm-up)"

  # Warm-up (not measured)
  curl -s -o /dev/null -X POST "$WP_GQL" \
    -H 'Content-Type: application/json' \
    --data-raw "{\"query\":$(jq -Rs . <<<"$QUERY")}"

  for i in $(seq 1 "$RUNS"); do
    read -r t sz < <(
      curl -s -o /dev/null \
        --write-out "%{time_total} %{size_download}" \
        -X POST "$WP_GQL" \
        -H 'Content-Type: application/json' \
        --data-raw "{\"query\":$(jq -Rs . <<<"$QUERY")}"
    )
    times+=("$t")
    sizes+=("$sz")
    printf "  run %2d: %.3fs  %d B\n" "$i" "$t" "$sz"
  done

  # Stats (sort -n is POSIX; avoids gawk-only asort)
  local sorted
  sorted=$(printf '%s\n' "${times[@]}" | sort -n)
  local n_t=${#times[@]}
  local avg min max p50 p95
  avg=$(printf '%s\n' "${times[@]}" | awk '{s+=$1;n++} END {printf "%.3f", s/n}')
  min=$(echo "$sorted" | head -1)
  max=$(echo "$sorted" | tail -1)
  p50=$(echo "$sorted" | awk -v n="$n_t" 'NR==int(n*0.50)+1{print;exit}')
  p95=$(echo "$sorted" | awk -v n="$n_t" 'NR==int(n*0.95)+1{print;exit}')
  printf "  → avg=%ss  min=%ss  max=%ss  p50=%ss  p95=%ss\n" \
    "$avg" "$min" "$max" "$p50" "$p95"

  local avg_size
  avg_size=$(printf '%s\n' "${sizes[@]}" | awk '{s+=$1;n++} END {printf "%d", s/n}')
  printf "  → avg response size: %d B  (~%.1f KB)\n" \
    "$avg_size" "$(echo "$avg_size" | awk '{printf "%.1f", $1/1024}')"

  # Export results for the comparison block
  BENCH_AVG="$avg"
  BENCH_P50="$p50"
  BENCH_P95="$p95"
  BENCH_AVG_SIZE="$avg_size"
}

# ── diff helper: prints "+X.XXXs (+Y%)" or "-X.XXXs (-Y%)" ───────────────────
fmt_diff() {
  # fmt_diff <before> <after> <unit>
  awk -v b="$1" -v a="$2" -v u="$3" 'BEGIN {
    d=a-b
    p=(b!=0) ? (d/b)*100 : 0
    sign=(d>=0)?"+":""
    printf "%s%.3f%s (%s%.1f%%)\n", sign, d, u, sign, p
  }'
}
# ──────────────────────────────────────────────────────────────────────────────

run_bench "BEFORE"
BEFORE_AVG="$BENCH_AVG"
BEFORE_P50="$BENCH_P50"
BEFORE_P95="$BENCH_P95"
BEFORE_SIZE="$BENCH_AVG_SIZE"

echo ""
echo "────────────────────────────────────────────────────"
echo "  Apply your changes now, then press [Enter] to run"
echo "  the AFTER benchmark with the same query."
echo "────────────────────────────────────────────────────"
read -r

run_bench "AFTER"
AFTER_AVG="$BENCH_AVG"
AFTER_P50="$BENCH_P50"
AFTER_P95="$BENCH_P95"
AFTER_SIZE="$BENCH_AVG_SIZE"

echo ""
echo "════════════════════════════════════════════════════"
echo "  BEFORE vs AFTER comparison"
echo "════════════════════════════════════════════════════"
printf "  %-18s  %8s  %8s  %s\n"   "metric"  "BEFORE"  "AFTER"  "change"
printf "  %-18s  %8ss  %8ss  %s\n" "avg time"  "$BEFORE_AVG"  "$AFTER_AVG"  "$(fmt_diff "$BEFORE_AVG" "$AFTER_AVG" s)"
printf "  %-18s  %8ss  %8ss  %s\n" "p50 time"  "$BEFORE_P50"  "$AFTER_P50"  "$(fmt_diff "$BEFORE_P50" "$AFTER_P50" s)"
printf "  %-18s  %8ss  %8ss  %s\n" "p95 time"  "$BEFORE_P95"  "$AFTER_P95"  "$(fmt_diff "$BEFORE_P95" "$AFTER_P95" s)"
printf "  %-18s  %8sB  %8sB  %s\n" "avg size"  "$BEFORE_SIZE"  "$AFTER_SIZE"  "$(fmt_diff "$BEFORE_SIZE" "$AFTER_SIZE" B)"
echo "════════════════════════════════════════════════════"
```
