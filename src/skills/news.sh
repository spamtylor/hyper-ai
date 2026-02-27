#!/bin/bash
# News Skill for Hyper
# Fetches latest tech/AI news

echo "=== Tech News ==="
curl -s "https://hn.algolia.com/api/v1/search_by_date?query=ai&tags=story&hitsPerPage=5" | jq -r '.hits[] | "- \(.title) (\(.points) points)"' 2>/dev/null
echo ""
echo "=== AI News ==="
curl -s "https://hn.algolia.com/api/v1/search_by_date?query=artificial+intelligence&tags=story&hitsPerPage=5" | jq -r '.hits[] | "- \(.title) (\(.points) points)"' 2>/dev/null
