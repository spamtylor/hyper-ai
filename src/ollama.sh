#!/bin/bash
# Connect to Titan's Ollama
OLLAMA_HOST="http://192.168.0.247:11434"

# Generate strictly escaped JSON using jq to avoid bash quote collisions
PAYLOAD=$(jq -n --arg p "$1" '{model: "qwen3:30b-a3b", prompt: $p, stream: false}')

curl -s -m 300 "$OLLAMA_HOST/api/generate" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD"
