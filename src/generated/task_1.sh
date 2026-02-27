#!/bin/bash
city="$1"
if [ -z "$city" ]; then
  echo "Usage: $0 <city>"
  exit 1
fi

api_key="YOUR_OPENWEATHER_API_KEY"
if [ -z "$api_key" ]; then
  echo "Error: API key not set. Set OPENWEATHER_API_KEY environment variable."
  exit 1
fi

response=$(curl -s "http://api.openweathermap.org/data/2.5/weather?q=$city&appid=$api_key&units=metric")
temp=$(echo "$response" | jq -r '.main.temp')
desc=$(echo "$response" | jq -r '.weather[0].description')

if [ -z "$temp" ] || [ -z "$desc" ]; then
  echo "Error: Failed to fetch weather data for $city"
else
  echo "Current weather in $city: $desc, $temp°C"
fi
