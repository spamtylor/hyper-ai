#!/bin/bash
# Connect to Titan's Ollama
OLLAMA_HOST="http://192.168.0.247:11434"

curl -s "$OLLAMA_HOST/api/generate" \
  -d "{\"model\":\"qwen3:30b-a3b\",\"prompt\":\"$1\",\"stream\":false}"
