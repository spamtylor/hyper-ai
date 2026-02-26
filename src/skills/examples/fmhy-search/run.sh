#!/bin/bash
# FMHY Search Skill
# Usage: ./run.sh <search-query>

set -e

QUERY="${1:-}"
if [[ -z "$QUERY" ]]; then
    echo "Usage: ./run.sh <search-query>"
    echo "Example: ./run.sh python tutorials"
    exit 1
fi

echo "Searching FMHY for: $QUERY"

# FMHY base URL (using allorigins proxy to avoid CORS)
FMHY_URL="https://fmhy.net"
PROXY_URL="https://api.allorigins.win/raw?url=$(echo "$FMHY_URL" | jq -sRr @uri)"

# Fetch FMHY page
CONTENT=$(curl -sS "$PROXY_URL" 2>/dev/null || echo "")

if [[ -z "$CONTENT" ]]; then
    echo "Warning: Could not fetch FMHY directly"
    echo "Try: https://fmhy.net (manual search)"
else
    # Simple grep-based search (FMHY is plain HTML)
    echo "$CONTENT" | grep -i "$QUERY" | head -10 || echo "No direct matches found"
fi

# Save search to research directory
OUTPUT_DIR="$(dirname "$(dirname "$(pwd)")")/research/fmhy"
mkdir -p "$OUTPUT_DIR"

TIMESTAMP=$(date +%Y-%m-%d-%H%M)
SAVED_QUERY=$(echo "$QUERY" | tr ' ' '-')

cat > "$OUTPUT_DIR/${SAVED_QUERY}-$TIMESTAMP.md" <<EOF
# FMHY Search: $QUERY
Generated: $(date)

## Query
$QUERY

## Notes
Add research notes here...

## Links
- FMHY: https://fmhy.net
- Search URL: https://fmhy.net/?s=$(echo "$QUERY" | jq -sRr @uri)
EOF

echo ""
echo "Saved research to: $OUTPUT_DIR/${SAVED_QUERY}-$TIMESTAMP.md"
