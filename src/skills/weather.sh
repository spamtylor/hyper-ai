#!/bin/bash
# Weather Skill for Hyper
# Usage: weather.sh [city]

CITY="${1:-Springtown}"
echo "Weather for $CITY:"
curl -s "wttr.in/$CITY?format=%c%t+%w"
echo ""
