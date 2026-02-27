#!/bin/bash
LOCATION="$1"
API_KEY="$WEATHER_API_KEY"

if [ -z "$LOCATION" ]; then
  echo "Error: Location required"
  exit 1
fi

if [ -z "$API_KEY" ]; then
  echo "Error: WEATHER_API_KEY not set"
  exit 1
fi

RESPONSE=$(curl -s "http://api.openweathermap.org/data/2.5/weather?q=$LOCATION&appid=$API_KEY&units=metric")

if [ $? -ne 0 ]; then
  echo "Error: Failed to fetch weather data"
  exit 1
fi

DESCRIPTION=$(echo "$RESPONSE" | jq -r '.weather[0].description')
TEMP=$(echo "$RESPONSE" | jq -r '.main.temp')

if [ -z "$DESCRIPTION" ] || [ -z "$TEMP" ]; then
  echo "Error: Invalid weather data"
  exit 1
fi

echo "Current weather in $LOCATION: $DESCRIPTION, $TEMP°C"
