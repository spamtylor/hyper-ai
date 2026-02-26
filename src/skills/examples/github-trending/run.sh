#!/bin/bash
# GitHub Trending Skill
# Usage: ./run.sh [language|period]
# Examples:
#   ./run.sh python        # Python repos, default period
#   ./run.sh "python|weekly"  # Python repos from this week

set -e

# Parse input
INPUT="${1:-}"
LANG="${INPUT%%|*}"
PERIOD="${INPUT##*|}"

if [[ "$LANG" == "$PERIOD" ]]; then
    PERIOD="daily"
fi

# Validate language
VALID_LANGS="python javascript typescript go rust java c++ c# ruby php swift kotlin"
if [[ -n "$LANG" && "$VALID_LANGS" != *"$LANG"* ]]; then
    echo "Warning: '$LANG' may not be a valid language, proceeding anyway" >&2
fi

# Fetch trending repos
echo "Fetching GitHub trending ($LANG) - $PERIOD..."

# Use gh CLI if available, else curl
if command -v gh &> /dev/null; then
    # gh doesn't have trending, use web fetch
    URL="https://github.com/trending/$LANG?since=$PERIOD"
    CONTENT=$(curl -sS "https://api.allorigins.win/raw?url=$(urlencode "$URL")" 2>/dev/null || echo "")
    
    if [[ -z "$CONTENT" ]]; then
        echo "Using fallback method..."
        # Fallback: just show the URL
        echo "## GitHub Trending: $LANG ($PERIOD)"
        echo ""
        echo "View at: https://github.com/trending/$LANG?since=$PERIOD"
    else
        echo "$CONTENT" | grep -oE 'href="/[^"]+"' | grep -v '/stars' | head -20
    fi
else
    echo "gh CLI not found. Install from: https://cli.github.com"
    exit 1
fi

# Save to research directory
OUTPUT_DIR="$(dirname "$(dirname "$(pwd)")")/research/github-trending"
mkdir -p "$OUTPUT_DIR"

TIMESTAMP=$(date +%Y-%m-%d-%H%M)
cat > "$OUTPUT_DIR/${LANG:-all}-${PERIOD}-$TIMESTAMP.md" <<EOF
# GitHub Trending: $LANG ($PERIOD)
Generated: $(date)

## Links
View trending: https://github.com/trending/$LANG?since=$PERIOD

## Notes
EOF

echo ""
echo "Saved to: $OUTPUT_DIR/${LANG:-all}-${PERIOD}-$TIMESTAMP.md"
